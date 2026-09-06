import {
  DEFAULT_APPEARANCE_PREFERENCE,
  DEFAULT_DATE_FORMAT,
  DEFAULT_LANGUAGE_PREFERENCE,
  DEFAULT_PREFERENCES,
  DEFAULT_TIME_FORMAT,
} from "@repo/domain-preferences"
import type { Preferences } from "@repo/domain-preferences"
import type { PreferencesResetOptions } from "./model"
/**
 * Preferences reset utilities.
 *
 * Provides strategies for resetting preferences to defaults
 * or to custom values.
 */
export class PreferencesReset {
  /**
   * Get default preferences for all concepts.
   */
  static getDefaults() {
    return { ...DEFAULT_PREFERENCES }
  }

  /**
   * Get preferences to reset based on options.
   * Returns only the preferences that should be reset.
   *
   * Caller must merge with existing preferences to create complete state.
   */
  static getResetPreferences(
    options: PreferencesResetOptions
  ): Partial<Preferences> {
    const reset: Partial<Preferences> = {}

    if (options.resetAll) {
      return { ...DEFAULT_PREFERENCES }
    }

    if (options.resetAppearance) {
      reset.appearance = DEFAULT_APPEARANCE_PREFERENCE
    }

    if (options.resetLanguage) {
      reset.language = DEFAULT_LANGUAGE_PREFERENCE
    }

    if (options.resetDateTime) {
      reset.dateFormat = DEFAULT_DATE_FORMAT
      reset.timeFormat = DEFAULT_TIME_FORMAT
    }

    return reset
  }

  /**
   * Check if a preference is at its default value.
   * Throws if key is not a valid preference.
   */
  static isDefault(key: string, value: unknown): boolean {
    // Validate key dynamically against DEFAULT_PREFERENCES
    if (!(key in DEFAULT_PREFERENCES)) {
      throw new Error(`Unknown preference key: ${key}`)
    }

    return DEFAULT_PREFERENCES[key as keyof Preferences] === value
  }
}
