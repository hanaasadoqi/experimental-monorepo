/**
 * @fileoverview Public contract exports from @repo/contracts
 * Combines schemas, types, defaults, and utilities into a single entry point.
 */

// All types (includes domain types and schema-inferred types)
export * from "./types"

// Export schemas
export { themeFormSchema, themeOklchColorSchema, appearancePreferenceSchema, preferencesStateSchema, loginFormSchema } from "./schemas"

// Export defaults
export { OKLCH_REGEX, DEFAULT_THEME, DEFAULT_APPEARANCE_MODE, OKLCH_CONSTRAINTS } from "./defaults/theme"

// Export utilities
export { validateSchema, parseSchema, tryParseSchema } from "./utils/schema-utils.js"
