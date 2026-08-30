/**
 * @fileoverview Public contract exports from @repo/contracts
 * Combines schemas and types into a single entry point.
 */

// Re-export all types
export type {
  AppearancePreference,
  PreferencesState,
  Theme,
  ThemeForm,
  ThemeAppearance,
  ThemeOklchColor,
  LoginForm,
  ValidationError,
} from "./types"

// Re-export all schemas
export {
  themeFormSchema,
  themeOklchColorSchema,
  appearancePreferenceSchema,
  preferencesStateSchema,
} from "./schemas"
