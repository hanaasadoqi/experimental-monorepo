/**
 * @fileoverview Zod schemas and validation logic.
 * This is the internal directory for schemas. Re-exported through @repo/contracts main index.
 */

export {
  appearancePreferenceSchema,
  preferencesStateSchema,
  type PreferencesState,
  type AppearancePreference,
} from "./preferences"
export {
  themeAppearanceSchema,
  themeOklchColorSchema,
  themeFormSchema,
  type ThemeForm,
  type ThemeAppearance,
  type ThemeOklchColor,
  type Theme,
} from "./theme"
export { loginFormSchema, type LoginForm } from "./auth"
export {
  validateSchema,
  parseSchema,
  tryParseSchema,
  type ValidationError,
} from "../utils/schema-utils"
