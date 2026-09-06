import { SHADE_STEPS, STEP_LIGHTNESS } from "../constants"
import { oklchToCss, oklchToHex } from "./convert"
import { clampC, clampH, clampL, maxChromaInGamut } from "./gamut"
import type { Oklch, Shade } from "./core-model"

/** One of the 11 canonical shade steps. */
export type ShadeStep = (typeof SHADE_STEPS)[number]

/**
 * Generate a shade ramp from a base OKLCH color.
 *
 * Lightness follows the fixed perceptual curve in `STEP_LIGHTNESS`. Chroma is
 * held at the base value and pulled back only where the sRGB gamut cannot hold
 * it, which makes the ramp taper naturally toward white and black — e.g. a base
 * of `{ l: 0.58, c: 0.15 }` yields c=0.015 at step 50, 0.150 at 400-500, and
 * 0.045 at 950. Every swatch is therefore a real, renderable color.
 *
 * The step whose target lightness is closest to the base renders the base color
 * exactly and is flagged `isBase`.
 */
export function generateShades(base: Oklch): Shade[] {
  const baseL = clampL(base.l)
  const baseC = clampC(base.c)
  const h = clampH(base.h)

  let closestStep: number = SHADE_STEPS[0]
  let closestDist = Number.POSITIVE_INFINITY
  for (const step of SHADE_STEPS) {
    const dist = Math.abs((STEP_LIGHTNESS[step] ?? -1) - baseL)
    if (dist < closestDist) {
      closestDist = dist
      closestStep = step
    }
  }

  return SHADE_STEPS.map((step) => {
    const isBase = step === closestStep
    const targetL = clampL(isBase ? baseL : (STEP_LIGHTNESS[step] ?? baseL))

    const maxC = maxChromaInGamut(targetL, h)
    const targetC = Math.min(baseC, maxC)
    const inGamut = targetC >= baseC - 1e-6

    return {
      step,
      l: targetL,
      c: targetC,
      h,
      hex: oklchToHex({ l: targetL, c: targetC, h }),
      css: oklchToCss({ l: targetL, c: targetC, h }),
      inGamut,
      isBase,
    }
  })
}

export interface GenerateShadeScaleOptions {
  color: Oklch
  /** Which of the 11 steps the seed should occupy. Defaults to 500 — this is
   * a default, not a forced destination: pass any step and the seed lands
   * there instead. */
  anchorShade?: ShadeStep
}

const lastStep = SHADE_STEPS[SHADE_STEPS.length - 1] ?? 950
const LIGHT_REFERENCE_L = STEP_LIGHTNESS[SHADE_STEPS[0]] ?? 0.97
const DARK_REFERENCE_L = STEP_LIGHTNESS[lastStep] ?? 0.16

/**
 * Generate an 11-step shade ramp anchored so the seed color occupies the
 * requested step exactly (before gamut fitting), rather than guessing the
 * closest step as `generateShades` does.
 *
 * Every other step's lightness is computed by interpolating between the
 * seed's own lightness (at the anchor) and a light/dark ceiling-or-floor —
 * using `STEP_LIGHTNESS`'s existing curve shape only to weight *how far*
 * each step sits from the anchor, not as an absolute target. This makes the
 * whole ramp shift with the seed's actual lightness (two seeds with
 * different `l` produce genuinely different ramps at every step) while
 * guaranteeing monotonic progression and headroom at both ends even for an
 * extreme seed (e.g. anchoring a near-white seed at step 100 still leaves
 * room for a distinct step 50 above it, and 200-950 below it).
 *
 * Chroma reuses `generateShades`' gamut-only tapering: held at the seed's
 * chroma and pulled back only where the sRGB gamut cannot hold it at that
 * step's lightness — so it scales with the seed's own chroma rather than a
 * fixed curve, with no arbitrary peak forced at any particular step.
 */
export function generateShadeScale({
  color,
  anchorShade = 500,
}: GenerateShadeScaleOptions): Shade[] {
  const seedL = clampL(color.l)
  const seedC = clampC(color.c)
  const h = clampH(color.h)

  const anchorReferenceL = STEP_LIGHTNESS[anchorShade] ?? seedL
  // Guarantee headroom above/below the seed even when it's already near an
  // extreme, so neighboring steps never collapse onto the anchor's value.
  const ceilingL = Math.min(1, Math.max(LIGHT_REFERENCE_L, seedL + 0.02))
  const floorL = Math.max(0, Math.min(DARK_REFERENCE_L, seedL - 0.02))

  return SHADE_STEPS.map((step) => {
    const isBase = step === anchorShade
    const referenceL = STEP_LIGHTNESS[step] ?? seedL

    let targetL: number
    if (isBase) {
      targetL = seedL
    } else if (referenceL > anchorReferenceL) {
      // Lighter than the anchor in the reference curve's ordering.
      const span = LIGHT_REFERENCE_L - anchorReferenceL
      const t = span > 0 ? (referenceL - anchorReferenceL) / span : 1
      targetL = seedL + t * (ceilingL - seedL)
    } else {
      // Darker than (or equal to, which shouldn't happen given distinct
      // STEP_LIGHTNESS values) the anchor.
      const span = anchorReferenceL - DARK_REFERENCE_L
      const t = span > 0 ? (anchorReferenceL - referenceL) / span : 1
      targetL = seedL - t * (seedL - floorL)
    }
    targetL = clampL(targetL)

    const maxC = maxChromaInGamut(targetL, h)
    const targetC = Math.min(seedC, maxC)
    const inGamut = targetC >= seedC - 1e-6

    return {
      step,
      l: targetL,
      c: targetC,
      h,
      hex: oklchToHex({ l: targetL, c: targetC, h }),
      css: oklchToCss({ l: targetL, c: targetC, h }),
      inGamut,
      isBase,
    }
  })
}
