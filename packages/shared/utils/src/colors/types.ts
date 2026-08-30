/**
 * OKLch Color Space Representation
 *
 * Represents a color in cylindrical OKLch (lightness, chroma, hue) format.
 * Perceptually uniform for both lightness and colorfulness.
 *
 * @see {@link https://oklab.github.io|OKLab specification}
 */
export {
  type oklchColor,
  oklchColorSchema,
  type OklchStr,
  lmsColorSchema,
  type lmsColor,
  oklchStrSchema,
  OKLCH_REGEX,
  OKLCH_CONSTRAINTS,
  MAX_CHROMA,
  MIN_CHROMA,
  MIN_LIGHTNESS,
  MAX_LIGHTNESS,
  MAX_HUE,
  MIN_HUE,
  CONTRAST_THRESHOLDS,
} from "@repo/shared-contracts"
