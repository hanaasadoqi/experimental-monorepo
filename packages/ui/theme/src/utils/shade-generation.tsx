/**
 * Shade generation utilities for OKLCH color scales.
 *
 * Hue-aware chroma calibration, perceptual lightness distribution, and WCAG
 * contrast for building 11-step scales from a single base color.
 *
 * UNITS: lightness is on the domain's canonical **0..1** scale everywhere in
 * this module — the same scale as `oklchColorSchema`, `DEFAULT_OKLCH`, and
 * every picker. It previously used 0..100, which silently produced near-black
 * output wherever a domain color crossed into it.
 *
 * Colour maths is delegated to `@repo/domain-theme` rather than reimplemented:
 * serialization, luminance, and contrast all have one implementation there.
 */

import {
  type ColorScale,
  calculateContrastRatio,
  generateHarmony,
  generateShadeScale,
  getAccessibleForeground,
  getWCAGLevel,
  HARMONY_HUE_OFFSETS,
  luminanceFromOklch,
  maxChromaInGamut,
  type Oklch,
  type OklchComponents,
  oklchToCss,
  parseOklchString,
} from "@repo/domain-theme"

export type ScaleStep =
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950

export const SCALE_STEPS: ScaleStep[] = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
]

/**
 * Lightness deltas from the anchor point (light mode: L=0.52, dark mode: L=0.58).
 * Step 500 = anchor, positive delta = lighter, negative = darker.
 */
export const LIGHTNESS_STEPS: Record<ScaleStep, number> = {
  50: 0.46,
  100: 0.4,
  200: 0.3,
  300: 0.18,
  400: 0.1,
  500: 0,
  600: -0.08,
  700: -0.16,
  800: -0.24,
  900: -0.32,
  950: -0.38,
}

/**
 * Chroma multipliers per step — keep mid-range vibrant, compress extremes
 */
export const CHROMA_MULTIPLIERS: Record<ScaleStep, number> = {
  50: 0.08,
  100: 0.22,
  200: 0.42,
  300: 0.62,
  400: 0.82,
  500: 1.15,
  600: 1.15,
  700: 1.0,
  800: 0.88,
  900: 0.72,
  950: 0.6,
}

/**
 * Hue-aware chroma multiplier.
 * Human color perception varies across the hue wheel:
 * - Yellows appear most saturated → reduce chroma
 * - Blues/cyans appear least saturated → boost chroma
 * - Reds/greens are in the middle
 */
export function getHueChromaFactor(hue: number): number {
  const h = ((hue % 360) + 360) % 360

  // Piecewise linear interpolation across the hue wheel
  // Values calibrated against perceptual uniformity in OkLCH
  if (h < 30) return 1.0 + (h / 30) * 0.08 // Red → Red-yellow: 1.0 → 1.08
  if (h < 60) return 1.08 + ((h - 30) / 30) * 0.07 // Red-yellow → Yellow: 1.08 → 1.15
  if (h < 90) return 1.15 - ((h - 60) / 30) * 0.1 // Yellow → Yellow-green: 1.15 → 1.05
  if (h < 120) return 1.05 - ((h - 90) / 30) * 0.05 // Yellow-green → Green: 1.05 → 1.0
  if (h < 150) return 1.0 - ((h - 120) / 30) * 0.05 // Green → Cyan-green: 1.0 → 0.95
  if (h < 180) return 0.95 // Cyan-green → Cyan: stable
  if (h < 210) return 0.95 - ((h - 180) / 30) * 0.03 // Cyan → Blue-cyan: 0.95 → 0.92
  if (h < 240) return 0.92 - ((h - 210) / 30) * 0.04 // Blue-cyan → Blue: 0.92 → 0.88
  if (h < 270) return 0.88 + ((h - 240) / 30) * 0.04 // Blue → Blue-purple: 0.88 → 0.92
  if (h < 300) return 0.92 + ((h - 270) / 30) * 0.05 // Blue-purple → Magenta: 0.92 → 0.97
  if (h < 330) return 0.97 + ((h - 300) / 30) * 0.03 // Magenta → Red-magenta: 0.97 → 1.0
  return 1.0 // Red-magenta → Red
}

/**
 * Calibrate lightness for perceptual uniformity.
 * OkLCH is already perceptually uniform but compress extremes slightly
 * to avoid muddy near-blacks and washed-out near-whites.
 *
 * `rawL` and the return value are both 0..1.
 */
export function calibrateLightness(rawL: number, hue: number): number {
  const clamped = Math.min(0.995, Math.max(0.03, rawL))

  // Near white: compress to avoid washed appearance
  if (clamped > 0.91) {
    return 0.91 + (clamped - 0.91) * 0.75
  }
  // Near black: expand very slightly for visibility
  if (clamped < 0.12) {
    return 0.03 + (clamped - 0.03) * 1.2
  }
  // Warm hues (yellows 50–80°) benefit from a small lightness boost at mid steps
  const h = ((hue % 360) + 360) % 360
  if (h >= 50 && h <= 80 && clamped > 0.45 && clamped < 0.7) {
    return clamped + 0.02
  }

  return clamped
}

/**
 * Main scale derivation function.
 * Produces a full 11-step OkLCH color scale from a base color.
 *
 * Lightness is delegated to the domain's `generateShadeScale`, anchored at
 * step 500 so `base.l` is actually reflected in the output (this module
 * previously anchored every scale at a fixed 0.52/0.58 regardless of the
 * seed's own lightness — see the finding #3 regression tests). In "dark"
 * mode the resulting 11 values are reversed across the step labels, which
 * preserves this function's existing "step 50 darkest / 950 lightest in
 * dark mode" convention (an explicit prior product choice, not something
 * this fix changes) on top of the corrected, seed-relative math.
 *
 * Chroma keeps this module's own hue-aware tapering (`getHueChromaFactor` /
 * `CHROMA_MULTIPLIERS`), gamut-clipped at each step's now-correct lightness
 * so it never exceeds the domain schema's declared chroma ceiling.
 */
export function deriveScale(
  base: Oklch,
  mode: "light" | "dark" = "light"
): ColorScale {
  const anchored = generateShadeScale({ color: base, anchorShade: 500 })
  const ordered = mode === "dark" ? [...anchored].reverse() : anchored
  const hueFactor = getHueChromaFactor(base.h)

  const entries = SCALE_STEPS.map(
    (step: ScaleStep, i: number): [ScaleStep, Oklch] => {
      const l = ordered[i]?.l ?? base.l
      const stepMultiplier = CHROMA_MULTIPLIERS[step]
      const rawC = base.c * hueFactor * (stepMultiplier ?? 1)
      const c = Math.max(0, Math.min(maxChromaInGamut(l, base.h), rawC))

      return [step, { l, c, h: base.h }] as [ScaleStep, Oklch]
    }
  )

  return Object.fromEntries(entries) as ColorScale
}

/**
 * Converts OKLCH to a CSS string.
 *
 * Thin alias for the domain serializer, which is the single implementation.
 * Prefer importing `oklchToCss` from `@repo/domain-theme` in new code.
 */
export const toCss = oklchToCss

/** Degrees (public domain form) → radians (computation form). */
function toComponents(color: Oklch): OklchComponents {
  return {
    lightness: color.l,
    chroma: color.c,
    hue: (color.h * Math.PI) / 180,
  }
}

/** WCAG relative luminance, via the domain's transform pipeline. */
export function getRelativeLuminance(color: Oklch): number {
  return luminanceFromOklch(toComponents(color))
}

export function getContrastRatio(fg: Oklch, bg: Oklch): number {
  return calculateContrastRatio(
    getRelativeLuminance(fg),
    getRelativeLuminance(bg)
  )
}

export function getWcagLevel(ratio: number): "AAA" | "AA" | "Fail" {
  return getWCAGLevel(ratio)
}

/**
 * Generates an accessible, background-related foreground color (delegates
 * to the domain's `getAccessibleForeground` — see finding #2). Previously
 * limited to two fixed achromatic constants, which for some backgrounds
 * (e.g. `{l:0.55,c:0.12,h:120}`) produced a ratio as low as ~4.37, below the
 * 4.5 target — see the regression test.
 */
export function autoForeground(bg: Oklch): Oklch {
  const resultCss = getAccessibleForeground(oklchToCss(bg))
  return parseOklchString(resultCss) ?? { l: 0.1, c: 0, h: 0 }
}

/**
 * Generates scale as a CSS string record (step → oklch(...))
 */
export function deriveScaleCss(
  base: Oklch,
  mode: "light" | "dark" = "light"
): Record<string, string> {
  const scale = deriveScale(base, mode)
  return Object.fromEntries(
    SCALE_STEPS.map((step: ScaleStep) => [
      String(step),
      toCss(scale[step as keyof ColorScale] ?? { l: 0, c: 0, h: 0 }),
    ])
  )
}

/**
 * Color harmony generators.
 *
 * Delegates to the domain's single `generateHarmony` rather than rotating
 * hues independently — this function and `get-color-harmonies.ts` used to
 * implement divergent, non-gamut-fit geometry (finding #5/#12): this one
 * never generated "rectangle" while the other did, and neither gamut-fit
 * the rotated colors. Both now share one source; "rectangle" is included
 * here so the two no longer disagree on which types they support.
 */
export type HarmonyType =
  | "complementary"
  | "analogous"
  | "triadic"
  | "split-complementary"
  | "tetradic"
  | "rectangle"

export type ColorHarmony = {
  type: HarmonyType
  name: string
  description: string
  colors: Oklch[]
}

const HARMONY_DESCRIPTORS: Record<
  HarmonyType,
  { name: string; description: string }
> = {
  complementary: {
    name: "Complementary",
    description: "Opposite on the wheel — high contrast pair",
  },
  analogous: {
    name: "Analogous",
    description: "Adjacent hues — harmonious and cohesive",
  },
  triadic: {
    name: "Triadic",
    description: "Three hues evenly spaced — vibrant and balanced",
  },
  "split-complementary": {
    name: "Split Complement",
    description: "Complement split — less tension, more variety",
  },
  tetradic: {
    name: "Tetradic",
    description: "Four hues at 90° intervals — rich palette",
  },
  rectangle: {
    name: "Rectangle",
    description: "Two complementary pairs — complex but balanced",
  },
}

function harmonyColorsExcludingSeed(base: Oklch, type: HarmonyType): Oklch[] {
  const offsets = HARMONY_HUE_OFFSETS[type]
  const colors = generateHarmony(base, type)
  return offsets
    .map((offset, i) => ({ offset, color: colors[i]! }))
    .filter((entry) => entry.offset !== 0)
    .map((entry) => entry.color)
}

export function getHarmonies(base: Oklch): ColorHarmony[] {
  const types: HarmonyType[] = [
    "complementary",
    "analogous",
    "triadic",
    "split-complementary",
    "tetradic",
    "rectangle",
  ]
  return types.map((type) => {
    const colors =
      type === "analogous"
        ? // Existing shipped contract: [+30, -30] order (positive offset first).
          [...harmonyColorsExcludingSeed(base, type)].reverse()
        : harmonyColorsExcludingSeed(base, type)
    return { type, ...HARMONY_DESCRIPTORS[type], colors }
  })
}

/**
 * Named hue presets for quick primary color selection.
 * Lightness is 0..1, matching the domain scale.
 */
export type HuePreset = {
  name: string
  h: number
  c: number
  l: number
  category: string
}

export const HUE_PRESETS: HuePreset[] = [
  { name: "Rose", h: 10, c: 0.22, l: 0.55, category: "Warm" },
  { name: "Red", h: 25, c: 0.22, l: 0.52, category: "Warm" },
  { name: "Orange", h: 45, c: 0.2, l: 0.6, category: "Warm" },
  { name: "Amber", h: 65, c: 0.18, l: 0.65, category: "Warm" },
  { name: "Yellow", h: 85, c: 0.16, l: 0.7, category: "Warm" },
  { name: "Lime", h: 115, c: 0.18, l: 0.6, category: "Cool" },
  { name: "Green", h: 140, c: 0.18, l: 0.55, category: "Cool" },
  { name: "Emerald", h: 155, c: 0.18, l: 0.55, category: "Cool" },
  { name: "Teal", h: 175, c: 0.16, l: 0.55, category: "Cool" },
  { name: "Cyan", h: 195, c: 0.18, l: 0.58, category: "Cool" },
  { name: "Sky", h: 210, c: 0.18, l: 0.6, category: "Cool" },
  { name: "Blue", h: 240, c: 0.18, l: 0.58, category: "Cool" },
  { name: "Indigo", h: 255, c: 0.2, l: 0.55, category: "Purple" },
  { name: "Violet", h: 270, c: 0.2, l: 0.58, category: "Purple" },
  { name: "Purple", h: 285, c: 0.2, l: 0.57, category: "Purple" },
  { name: "Fuchsia", h: 300, c: 0.2, l: 0.58, category: "Purple" },
  { name: "Pink", h: 330, c: 0.2, l: 0.62, category: "Warm" },
  { name: "Slate", h: 240, c: 0.04, l: 0.52, category: "Neutral" },
]
