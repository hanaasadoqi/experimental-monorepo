import type { Preferences } from "@repo/domain-preferences"

/**
 * Re-export domain Preferences as UserPreferences for convenience.
 */
export type UserPreferences = Preferences
export type UserPreferencesKeys = keyof Preferences

/**
 * Validation result for preference changes.
 */
export interface PreferenceValidationResult {
  valid: boolean
  errors?: string[]
}

/**
 * Preferences change event — type-safe using generic discriminated union.
 * Each preference type is fully typed; TypeScript catches mismatches at compile time.
 *
 * @template K - The preference key being changed (e.g., "appearance", "language")
 *
 * @example
 * // Type-safe: TypeScript knows previous/current are AppearancePreference
 * const event: PreferencesChangeEvent<"appearance"> = {
 *   key: "appearance",
 *   previous: "light",
 *   current: "dark",
 *   timestamp: Date.now(),
 * }
 *
 * // Type error: would assign string | boolean instead of specific type
 * const invalid: PreferencesChangeEvent<"language"> = {
 *   key: "language",
 *   previous: true,  // ← TypeScript error: boolean is not a LanguagePreference
 *   current: "en",
 *   timestamp: Date.now(),
 * }
 */
export interface PreferencesChangeEvent<
  K extends keyof Preferences = keyof Preferences,
> {
  key: K
  previous: Preferences[K]
  current: Preferences[K]
  timestamp: number
}

/**
 * Preferences reset options.
 */
export interface PreferencesResetOptions {
  resetAppearance?: boolean
  resetLanguage?: boolean
  resetDateTime?: boolean
  resetAll?: boolean
}

/**
 * Preferences import/export format.
 */
export interface PreferencesSnapshot {
  version: "1.0"
  timestamp: number
  preferences: Preferences
}

/**
 * Result of attempting to restore preferences from a snapshot.
 * H4 FIX: Provides detailed error information instead of silent null returns.
 */
export interface SnapshotRestorationResult {
  success: boolean
  data: Preferences | null
  error?: string
  errorCode?: string
}
