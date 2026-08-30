/**
 * Color Utilities
 *
 * OKLch color space math and WCAG 2.0 accessibility calculations.
 * No external dependencies. Usable in any project.
 *
 * @module @repo/shared-utils/colors
 */
// ====== Parsing ======
export { parseOklch, assertOklch, validateOklch, isValidOklch } from "./parse-oklch"

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
  suggestTextColorForBackground,
  adjustContrastByLightness,
  CONTRAST_THRESHOLDS,
} from "./contrast"
