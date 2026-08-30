/**
 * Design System Utilities
 *
 * Combines color utilities (from @repo/shared-utils) and design-system-specific
 * token resolution. Users can import from either package depending on their needs.
 *
 * @module @repo/ui-design-system/utils
 */

// ====== Re-export Colors from Shared Utils ======
// (For backwards compatibility — colors are now in shared-utils)
export {
  parseOklch,
  assertOklch,
  validateOklch,
  transformOklchToLMS,
  transformLMStoRgb,
  calculateLuminanceFromRgb,
  luminance,
  luminanceFromOklch,
  tryLuminance,
  contrastRatio,
  calculateContrastRatio,
  meetsContrastRequirement,
  CONTRAST_THRESHOLDS,
} from "@repo/shared-utils/colors/index"

// ====== Design-System Specific: Tokens ======
export type { TokenMap } from "../types"
export {
  declarationsFor,
  clearDeclarationsCache,
  declarationsForSelectors,
} from "./declarations"
export { resolveToken, validateTokenExists, validateAllTokens } from "./resolve"
