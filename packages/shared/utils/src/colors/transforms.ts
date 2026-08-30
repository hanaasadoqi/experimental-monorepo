import { lmsColor, oklchColor } from "./types";


/**
 * OKLch to LMS transformation coefficients
 * Derived from Björn Ottosson's OKLab specification
 * @see https://bottosson.github.io/posts/oklab/
 */
export const OKLCH_TO_LMS_COEFFICIENTS = {
  L: { primary: 0.3963377774, secondary: 0.2158037573 },
  M: { primary: -0.1055613458, secondary: -0.0638541728 },
  S: { primary: -0.0894841775, secondary: -1.291485548 },
} as const

/**
 * LMS to linear RGB transformation matrix
 * Maps cone response space to linear RGB color space
 */
export const LMS_TO_RGB_MATRIX = [
  [4.0767416621, -3.3077115913, 0.2309699292], // Red
  [-1.2684380046, 2.6097574011, -0.3413193965], // Green
  [-0.0041960863, -0.7034186147, 1.707614701], // Blue
] as const

/**
 * WCAG 2.0 relative luminance coefficients
 * Weights for human eye sensitivity to RGB channels
 */
export const RGB_TO_LUMINANCE_WEIGHTS = [0.2126, 0.7152, 0.0722] as const

/**
 * Converts OKLch (cylindrical) to LMS (cone response space).
 * @param oklch - OKLch color components
 * @returns LMS components for RGB transformation
 */
export function transformOklchToLMS(oklch: oklchColor): lmsColor {
  const { lightness, chroma, hue } = oklch
  const a = chroma * Math.cos(hue)
  const b = chroma * Math.sin(hue)

  return {
    l:
      (lightness +
        OKLCH_TO_LMS_COEFFICIENTS.L.primary * a +
        OKLCH_TO_LMS_COEFFICIENTS.L.secondary * b) **
      3,
    m:
      (lightness +
        OKLCH_TO_LMS_COEFFICIENTS.M.primary * a +
        OKLCH_TO_LMS_COEFFICIENTS.M.secondary * b) **
      3,
    s:
      (lightness +
        OKLCH_TO_LMS_COEFFICIENTS.S.primary * a +
        OKLCH_TO_LMS_COEFFICIENTS.S.secondary * b) **
      3,
  }
}

/**
 * Converts LMS to linear RGB with clamping to valid range [0, 1].
 * @param lms - LMS cone response components
 * @returns Linear RGB as readonly tuple, clamped to [0, 1]
 */
export function transformLMStoRgb(
  lms: lmsColor
): readonly [number, number, number] {
  const { l, m, s } = lms

  return [
    Math.max(
      0,
      Math.min(
        1,
        LMS_TO_RGB_MATRIX[0][0] * l +
          LMS_TO_RGB_MATRIX[0][1] * m +
          LMS_TO_RGB_MATRIX[0][2] * s
      )
    ),
    Math.max(
      0,
      Math.min(
        1,
        LMS_TO_RGB_MATRIX[1][0] * l +
          LMS_TO_RGB_MATRIX[1][1] * m +
          LMS_TO_RGB_MATRIX[1][2] * s
      )
    ),
    Math.max(
      0,
      Math.min(
        1,
        LMS_TO_RGB_MATRIX[2][0] * l +
          LMS_TO_RGB_MATRIX[2][1] * m +
          LMS_TO_RGB_MATRIX[2][2] * s
      )
    ),
  ] as const
}

/**
 * Calculates relative luminance from linear RGB per WCAG 2.0.
 * @param rgb - Linear RGB color components [r, g, b]
 * @returns Luminance value (0-1) where 0=black, 1=white
 */
export function calculateLuminanceFromRgb(
  rgb: readonly [number, number, number]
): number {
  const [r, g, b] = rgb
  return (
    RGB_TO_LUMINANCE_WEIGHTS[0] * r +
    RGB_TO_LUMINANCE_WEIGHTS[1] * g +
    RGB_TO_LUMINANCE_WEIGHTS[2] * b
  )
}
