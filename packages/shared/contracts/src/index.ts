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
  ThemeState,
  ThemeActions,
  ThemeStore,
} from "./types/store"
export type { LoginMethod, AuthProvider } from "./types/auth"
export { loginFormSchema, type LoginForm } from "./schemas/auth"
// Utility types
export type { ValidationError } from "./utils/schema-utils"
export {
  validateSchema,
  parseSchema,
  tryParseSchema,
} from "./utils/schema-utils"
export type {
  GuardSchema,
  SchemaInput,
  SchemaOutput,
} from "./utils/validate-utils"
export {
  assertMatchesSchema,
  createSchemaGuard,
  matchesSchema,
  parseUnknown,
  safeParseUnknown,
} from "./utils/validate-utils"
export {
  HTTP_URL_PATTERN,
  EMAIL_PATTERN,
  UUID_PATTERN,
} from "./defaults/storage"
