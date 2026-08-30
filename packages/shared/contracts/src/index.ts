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
export type { ThemeColor, Theme } from "./types/theme.js"
export type { LoginMethod, AuthProvider } from "./types/auth.js"
export type {
  PersistenceAdapter,
  PersistenceConfig,
  CookieAdapterOptions,
  SameSiteOptions,
} from "./types/storage.js"
export type {
  ResolvedAppearance,
  AppearanceSource,
  SavedAppearancePreference,
  UserPreferences,
} from "./types/preference.js"

export { loginFormSchema, type LoginForm } from "./schemas/auth.js"
export {
  appearancePreferenceSchema,
  type AppearancePreference,
  preferencesStateSchema,
  type PreferencesState,
} from "./schemas/preferences.js"
export { themeFormSchema, type ThemeForm } from "./schemas/theme.js"
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
export {
  DEFAULT_APPEARANCE_PREFERENCE,
  DEFAULT_PREFERENCES_STATE,
} from "./defaults/preferences.js"
export { DEFAULT_THEME } from "./defaults/theme.js"
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
