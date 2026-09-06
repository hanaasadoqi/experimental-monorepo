/**
 * `@repo/domain-preferences` — pure preferences domain layer.
 *
 * No React, no Next.js, no browser APIs, no state management.
 * See `.docs/architecture-boundaries.md`.
 *
 * One folder per concept. Each owns schemas (model.ts) + constants (defaults.ts):
 *
 *   appearance/  - AppearancePreference type ("light" | "dark" | "system")
 *                - ResolvedAppearancePreference type ("light" | "dark")
 *   language/    - LanguagePreference type (specific locale enum)
 *   date-time/   - DateFormatPreference and TimeFormatPreference types
 *   preferences/ - Preferences type combining all preference types
 *
 * All types exported from root index. No implementation, only types & validation.
 */

// Appearance
export {
  appearancePreferenceSchema,
  resolvedPreferenceSchema,
  DEFAULT_APPEARANCE_PREFERENCE,
  DEFAULT_RESOLVED_PREFERENCE,
  APPEARANCE_OPTIONS,
  RESOLVED_APPEARANCE_OPTIONS,
} from "./appearance"
export type {
  AppearancePreference,
  ResolvedAppearancePreference,
} from "./appearance"

// Language
export {
  getIsRTL,
  languagePreferenceSchema,
  DEFAULT_LANGUAGE_PREFERENCE,
  languageDisplayOptions,
  LANGUAGE_PREFERENCE_OPTIONS,
} from "./language"
export type {
  LanguagePreference,
  LanguageOption,
  LanguagePreferenceOption,
  LanguageDisplayOption,
  LanguageDisplayMap,
} from "./language"

// Date & Time
export {
  DATE_FORMAT_DISPLAY_OPTIONS,
  TIME_FORMAT_DISPLAY_OPTIONS,
  dateFormatPreferenceSchema,
  timeFormatPreferenceSchema,
  DEFAULT_DATE_FORMAT,
  DEFAULT_TIME_FORMAT,
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
} from "./date-time"
export type { DateFormatPreference, TimeFormatPreference } from "./date-time"

// Preferences
export { preferencesSchema, DEFAULT_PREFERENCES } from "./preferences/index"
export type { Preferences } from "./preferences/index"

// Export/Import
export {
  exportPreferences,
  importPreferences,
  generateExportFilename,
  type PreferencesExport,
} from "./export-import/index"
