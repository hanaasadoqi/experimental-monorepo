import { clampH, clampL, maxChromaInGamut } from "./gamut"
import type { ColorHarmony, Oklch } from "./core-model"

/**
 * Hue offsets (degrees, relative to the seed) for every rotation-based
 * harmony type. `monochromatic` isn't here — it doesn't rotate hue at all,
 * see `generateHarmony` below.
 *
 * `tetradic` and `square` are deliberately identical: `tetradic` is kept
 * only for backward compatibility (an ambiguous name the repair contract
 * asked to avoid going forward) and is not a separate geometry.
 */
export const HARMONY_HUE_OFFSETS: Record<
  Exclude<ColorHarmony, "monochromatic">,
  number[]
> = {
  complementary: [0, 180],
  analogous: [-30, 0, 30],
  triadic: [0, 120, 240],
  "split-complementary": [0, 150, 210],
  tetradic: [0, 90, 180, 270],
  square: [0, 90, 180, 270],
  rectangle: [0, 60, 180, 240], // 0, A, 180, 180+A with the documented default A=60
  "double-split-complementary": [-30, 30, 150, 210],
}

/** Lightness deltas (relative to the seed) for the monochromatic variant set. */
const MONOCHROMATIC_LIGHTNESS_DELTAS = [-0.3, -0.15, 0, 0.15, 0.3]

/**
 * Rotate the seed's hue by `offsetDeg` and gamut-fit at the result, holding
 * lightness exactly and reducing chroma only as far as the sRGB gamut
 * requires at that lightness/hue — this is what "harmony colors are not
 * gamut-fitted" (blind object-spread + hue rotation) was missing.
 */
function rotatedColor(seed: Oklch, offsetDeg: number): Oklch {
  const h = clampH(seed.h + offsetDeg)
  const c = Math.min(seed.c, maxChromaInGamut(seed.l, h))
  return { l: seed.l, c, h }
}

/**
 * Vary lightness (and, where the gamut requires it, chroma) around the seed
 * without rotating hue — the contract's monochromatic definition. Distinct
 * from `generateShadeScale`: this produces a small harmony-appropriate
 * variant set, not a full 11-step design-token scale.
 */
function monochromaticVariants(seed: Oklch): Oklch[] {
  return MONOCHROMATIC_LIGHTNESS_DELTAS.map((delta) => {
    const l = clampL(seed.l + delta)
    const c = Math.min(seed.c, maxChromaInGamut(l, seed.h))
    return { l, c, h: seed.h }
  })
}

/**
 * Generate a color harmony from `seed`. The single domain-owned
 * implementation for all 8 documented harmony types — UI layers should
 * consume this rather than independently rotating hues.
 *
 * Every generated color preserves the seed's own lightness (and chroma,
 * where gamut allows) rather than resetting to fixed defaults, and is
 * gamut-fit individually.
 */
export function generateHarmony(seed: Oklch, type: ColorHarmony): Oklch[] {
  if (type === "monochromatic") {
    return monochromaticVariants(seed)
  }
  return HARMONY_HUE_OFFSETS[type].map((offset) => rotatedColor(seed, offset))
}
