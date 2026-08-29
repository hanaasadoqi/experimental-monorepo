/**
 * Color Utilities
 *
 * OKLch color space math and WCAG 2.0 accessibility calculations.
 * No external dependencies. Usable in any project.
 *
 * @module @repo/shared-utils/colors
 */

// ====== Types ======
export type { OklchColor, OklchComponents, LmsComponents } from "./types"

// ====== Parsing ======
export { parseOklch, assertOklch, validateOklch } from "./parse-oklch"

// ====== Transformations ======
export {
  transformOklchToLMS,
  transformLMStoRgb,
  calculateLuminanceFromRgb,
  OKLCH_TO_LMS_COEFFICIENTS,
  LMS_TO_RGB_MATRIX,
  RGB_TO_LUMINANCE_WEIGHTS,
} from "./transforms"

// ====== Accessibility: Luminance ======
export { luminance, luminanceFromOklch, tryLuminance } from "./luminance"

// ====== Accessibility: Contrast ======
export {
  contrastRatio,
  calculateContrastRatio,
  meetsContrastRequirement,
  CONTRAST_THRESHOLDS,
} from "./contrast"
