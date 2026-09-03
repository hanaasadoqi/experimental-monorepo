import { SHADE_STEPS, STEP_LIGHTNESS } from "./constants"
import { oklchToCss, oklchToHex } from "./convert"
import { clampC, clampH, clampL, maxChromaInGamut } from "./gamut"
import type { Oklch, Shade } from "./model"

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
