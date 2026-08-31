/**
 * Accurate shade generation utilities for OkLCH color spaces.
 * This module provides hue-aware chroma calibration, perceptual lightness
 * distribution, and WCAG contrast validation for generating full 11-step
 * color scales from a single base color.
 */

export type OKLCH = { l: number; c: number; h: number }

export type ScaleStep =
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950

export type ColorScale = Record<ScaleStep, OKLCH>

export const SCALE_STEPS: ScaleStep[] = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
]

/**
 * Lightness deltas from the anchor point (light mode: L=52, dark mode: L=58)
 * Step 500 = anchor, positive delta = lighter, negative = darker
 */
const LIGHTNESS_STEPS: Record<ScaleStep, number> = {
  50: 46,
  100: 40,
  200: 30,
  300: 18,
  400: 10,
  500: 0,
  600: -8,
  700: -16,
  800: -24,
  900: -32,
  950: -38,
}

/**
 * Chroma multipliers per step — keep mid-range vibrant, compress extremes
 */
const CHROMA_MULTIPLIERS: Record<ScaleStep, number> = {
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
function getHueChromaFactor(hue: number): number {
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
 */
function calibrateLightness(rawL: number, hue: number): number {
  const clamped = Math.min(99.5, Math.max(3, rawL))

  // Near white: compress to avoid washed appearance
  if (clamped > 91) {
    return 91 + (clamped - 91) * 0.75
  }
  // Near black: expand very slightly for visibility
  if (clamped < 12) {
    return 3 + (clamped - 3) * 1.2
  }
  // Warm hues (yellows 50–80°) benefit from a small lightness boost at mid steps
  const h = ((hue % 360) + 360) % 360
  if (h >= 50 && h <= 80 && clamped > 45 && clamped < 70) {
    return clamped + 2
  }

  return clamped
}

/**
 * Main scale derivation function.
 * Produces a full 11-step OkLCH color scale from a base color.
 */
export function deriveScale(
  base: OKLCH,
  mode: "light" | "dark" = "light"
): ColorScale {
  const anchorL = mode === "light" ? 52 : 58
  const hueFactor = getHueChromaFactor(base.h)
  // In dark mode, FLIP the scale so step 50 is darkest and step 950 is lightest
  const deltaSign = mode === "dark" ? -1 : 1

  const entries = SCALE_STEPS.map((step) => {
    const rawL = anchorL + LIGHTNESS_STEPS[step] * deltaSign
    const l = calibrateLightness(rawL, base.h)

    const stepMultiplier = CHROMA_MULTIPLIERS[step]
    const c = Math.max(0, Math.min(0.5, base.c * hueFactor * stepMultiplier))

    return [step, { l, c, h: base.h }] as [ScaleStep, OKLCH]
  })

  return Object.fromEntries(entries) as ColorScale
}

/**
 * Converts OkLCH to CSS string
 */
export function toCss(color: OKLCH): string {
  return `oklch(${color.l.toFixed(2)}% ${color.c.toFixed(4)} ${color.h.toFixed(1)})`
}

/**
 * Convert OkLCH to approximate sRGB [0–255] via matrix math.
 * Used for WCAG luminance calculation without a culori dependency here.
 */
function oklchToLinearRgb(color: OKLCH): [number, number, number] {
  const l = color.l / 100
  const hRad = (color.h * Math.PI) / 180

  const a = color.c * Math.cos(hRad)
  const b = color.c * Math.sin(hRad)

  // OkLAB → LMS
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b

  const L = l_ * l_ * l_
  const M = m_ * m_ * m_
  const S = s_ * s_ * s_

  const r = 4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S
  const g = -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S
  const bv = -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S

  return [r, g, bv]
}

function linearize(c: number): number {
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

export function getRelativeLuminance(color: OKLCH): number {
  const [r, g, b] = oklchToLinearRgb(color)
  const R = linearize(Math.max(0, Math.min(1, r)))
  const G = linearize(Math.max(0, Math.min(1, g)))
  const B = linearize(Math.max(0, Math.min(1, b)))
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

export function getContrastRatio(fg: OKLCH, bg: OKLCH): number {
  const l1 = getRelativeLuminance(fg)
  const l2 = getRelativeLuminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function getWcagLevel(ratio: number): "AAA" | "AA" | "Fail" {
  if (ratio >= 7) return "AAA"
  if (ratio >= 4.5) return "AA"
  return "Fail"
}

/**
 * Returns white or black, whichever has better contrast against the given background
 */
export function autoForeground(bg: OKLCH): OKLCH {
  const white: OKLCH = { l: 97, c: 0, h: 0 }
  const black: OKLCH = { l: 10, c: 0, h: 0 }
  const whiteContrast = getContrastRatio(white, bg)
  const blackContrast = getContrastRatio(black, bg)
  return whiteContrast >= blackContrast ? white : black
}

/**
 * Generates scale as a CSS string record (step → oklch(...))
 */
export function deriveScaleCss(
  base: OKLCH,
  mode: "light" | "dark" = "light"
): Record<string, string> {
  const scale = deriveScale(base, mode)
  return Object.fromEntries(
    SCALE_STEPS.map((step) => [String(step), toCss(scale[step])])
  )
}

/**
 * Color harmony generators
 */
export type HarmonyType =
  "complementary" | "analogous" | "triadic" | "split-complementary" | "tetradic"

export type ColorHarmony = {
  type: HarmonyType
  name: string
  description: string
  colors: OKLCH[]
}

export function getHarmonies(base: OKLCH): ColorHarmony[] {
  const hue = (deg: number) => (((base.h + deg) % 360) + 360) % 360
  return [
    {
      type: "complementary",
      name: "Complementary",
      description: "Opposite on the wheel — high contrast pair",
      colors: [{ ...base, h: hue(180) }],
    },
    {
      type: "analogous",
      name: "Analogous",
      description: "Adjacent hues — harmonious and cohesive",
      colors: [
        { ...base, h: hue(30) },
        { ...base, h: hue(-30) },
      ],
    },
    {
      type: "triadic",
      name: "Triadic",
      description: "Three hues evenly spaced — vibrant and balanced",
      colors: [
        { ...base, h: hue(120) },
        { ...base, h: hue(240) },
      ],
    },
    {
      type: "split-complementary",
      name: "Split Complement",
      description: "Complement split — less tension, more variety",
      colors: [
        { ...base, h: hue(150) },
        { ...base, h: hue(210) },
      ],
    },
    {
      type: "tetradic",
      name: "Tetradic",
      description: "Four hues at 90° intervals — rich palette",
      colors: [
        { ...base, h: hue(90) },
        { ...base, h: hue(180) },
        { ...base, h: hue(270) },
      ],
    },
  ]
}

/**
 * Named hue presets for quick primary color selection
 */
export type HuePreset = {
  name: string
  h: number
  c: number
  l: number
  category: string
}

export const HUE_PRESETS: HuePreset[] = [
  { name: "Rose", h: 10, c: 0.22, l: 55, category: "Warm" },
  { name: "Red", h: 25, c: 0.22, l: 52, category: "Warm" },
  { name: "Orange", h: 45, c: 0.2, l: 60, category: "Warm" },
  { name: "Amber", h: 65, c: 0.18, l: 65, category: "Warm" },
  { name: "Yellow", h: 85, c: 0.16, l: 70, category: "Warm" },
  { name: "Lime", h: 115, c: 0.18, l: 60, category: "Cool" },
  { name: "Green", h: 140, c: 0.18, l: 55, category: "Cool" },
  { name: "Emerald", h: 155, c: 0.18, l: 55, category: "Cool" },
  { name: "Teal", h: 175, c: 0.16, l: 55, category: "Cool" },
  { name: "Cyan", h: 195, c: 0.18, l: 58, category: "Cool" },
  { name: "Sky", h: 210, c: 0.18, l: 60, category: "Cool" },
  { name: "Blue", h: 240, c: 0.18, l: 58, category: "Cool" },
  { name: "Indigo", h: 255, c: 0.2, l: 55, category: "Purple" },
  { name: "Violet", h: 270, c: 0.2, l: 58, category: "Purple" },
  { name: "Purple", h: 285, c: 0.2, l: 57, category: "Purple" },
  { name: "Fuchsia", h: 300, c: 0.2, l: 58, category: "Purple" },
  { name: "Pink", h: 330, c: 0.2, l: 62, category: "Warm" },
  { name: "Slate", h: 240, c: 0.04, l: 52, category: "Neutral" },
]
