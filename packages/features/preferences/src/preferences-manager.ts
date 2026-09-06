import {
  type Preferences,
  appearancePreferenceSchema,
  languagePreferenceSchema,
  dateFormatPreferenceSchema,
  timeFormatPreferenceSchema,
} from "@repo/domain-preferences"

/**
 * High-level preferences manager.
 *
 * Orchestrates preference operations across domain + runtime layers.
 * Provides type-safe methods for querying and updating preferences.
 *
 * Note: This is designed to be wrapped by runtime hooks.
 * See @repo/runtime-preferences for React integration.
 */
export class PreferencesManager {
  /**
   * Apply multiple preference changes atomically.
   *
   * Validates all changes before committing.
   * M5 FIX: Returns which changes succeeded vs failed.
   */
  static applyBatch(changes: Record<string, unknown>): {
    success: boolean
    applied: Partial<Preferences>
    failed: Record<string, string>
  } {
    const applied: Partial<Preferences> = {}
    const failed: Record<string, string> = {}

    for (const [key, value] of Object.entries(changes)) {
      const validation = this.validatePreference(
        key as keyof Preferences,
        value
      )
      if (validation.valid) {
        // Type cast is safe here because validatePreference ensures the value matches the schema
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(applied as any)[key] = value
      } else {
        failed[key] = validation.error || "Validation failed"
      }
    }

    return {
      success: Object.keys(failed).length === 0,
      applied,
      failed,
    }
  }

  /**
   * M7 FIX: Shallow merge strategy for preference updates.
   *
   * Current implementation uses shallow merge (Object.assign / spread operator)
   * for preferences. This works for the current flat structure where each preference
   * is a simple top-level property (appearance, language, dateFormat, timeFormat).
   *
   * IMPORTANT: If preferences are expanded to support nested objects in the future,
   * this strategy will need to change to deep merge to avoid data loss.
   * Example: { appearance: { userPref: "dark", systemFallback: "light" } }
   *
   * When adding nested preferences:
   * 1. Replace shallow merge with recursive deep merge utility
   * 2. Update validation to handle nested structures
   * 3. Add nested preference tests
   * 4. Update serialization/deserialization for nested data
   *
   * See: preferences-manager.ts:applyBatch() for merge location
   */

  /**
   * Validate a single preference change using Zod schema.
   * Key must be a valid preference property.
   * M2 FIX: Type-safe schema access instead of dynamic shape access.
   */
  static validatePreference(
    key: keyof Preferences,
    value: unknown
  ): { valid: boolean; error?: string } {
    // M2 FIX: Use explicit schema mapping instead of dynamic schema.shape[key]
    // Using any here is acceptable because we know all schemas implement safeParse()
    // and the runtime validation ensures type safety
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schemas: Record<keyof Preferences, any> = {
      appearance: appearancePreferenceSchema,
      language: languagePreferenceSchema,
      dateFormat: dateFormatPreferenceSchema,
      timeFormat: timeFormatPreferenceSchema,
    }

    const schema = schemas[key]
    if (!schema) {
      return {
        valid: false,
        error: `Unknown preference key: ${String(key)}`,
      }
    }

    const result = schema.safeParse(value)

    return {
      valid: result.success,
      error: result.success ? undefined : result.error.message,
    }
  }
}
