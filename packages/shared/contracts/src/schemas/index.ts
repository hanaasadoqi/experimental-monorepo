/**
 * @fileoverview Zod schemas and validation logic.
 * This is the internal directory for schemas. Re-exported through @repo/contracts main index.
 */

export {
  loginFormSchema,
  type LoginForm
} from "./auth.js"
export {
  appearancePreferenceSchema,
  type AppearancePreference,
  preferencesStateSchema,
  type PreferencesState
} from "./preferences.js"
export {
  themeFormSchema,
  type ThemeForm
} from "./theme.js"
export {
  oklchStrSchema,
  type OklchStr,
  oklchColorSchema,
  type oklchColor,
  lmsColorSchema,
  type lmsColor,
} from "./colors.js"
