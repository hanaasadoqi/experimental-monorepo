/**
 * @fileoverview Public contract exports from @repo/contracts
 * Combines schemas, types, defaults, and utilities into a single entry point.
 */

export type {
  StateCreator,
  StoreApi,
  UseBoundStore,
  Store,
  StoreCreator,
  SliceCreator,
  SliceState,
  SliceExtractor,
  Selector,
} from "./types/store.js"
export type { LoginMethod, AuthProvider } from "./types/auth.js"
export { loginFormSchema, type LoginForm } from "./schemas/auth.js"
export {
  oklchStrSchema,
  type OklchStr,
  oklchColorSchema,
  type oklchColor,
  lmsColorSchema,
  type lmsColor,
} from "./schemas/colors.js"
export {
  OKLCH_REGEX,
  DEFAULT_PRIMARY_BASE,
  OKLCH_CONSTRAINTS,
  MIN_CHROMA,
  MAX_CHROMA,
  MIN_HUE,
  MAX_HUE,
  MIN_LIGHTNESS,
  MAX_LIGHTNESS,
  CONTRAST_THRESHOLDS,
} from "./defaults/colors.js"
// Utility types
export type { ValidationError } from "./utils/schema-utils.js"
export {
  validateSchema,
  parseSchema,
  tryParseSchema,
} from "./utils/schema-utils.js"
export type {
  GuardSchema,
  SchemaInput,
  SchemaOutput,
} from "./utils/validate-utils.js"
export {
  assertMatchesSchema,
  createSchemaGuard,
  matchesSchema,
  parseUnknown,
  safeParseUnknown,
} from "./utils/validate-utils.js"
export {
  HTTP_URL_PATTERN,
  EMAIL_PATTERN,
  UUID_PATTERN,
} from "./defaults/storage.js"
