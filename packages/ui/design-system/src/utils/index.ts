/**
 * Design System Utilities
 *
 * Design-system-specific token parsing and resolution.
 *
 * @module @repo/ui-design-system/utils
 */

export type { TokenMap } from "../types"
export {
  declarationsFor,
  clearDeclarationsCache,
  declarationsForSelectors,
} from "./declarations"
export { resolveToken, validateTokenExists, validateAllTokens } from "./resolve"
