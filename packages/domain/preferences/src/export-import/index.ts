/**
 * Export and import preferences as JSON.
 * Pure functions with no dependencies on React, Next.js, or browser APIs.
 */
import { preferencesSchema, type Preferences } from "../preferences/index"

export interface PreferencesExport {
  version: 1
  exportedAt: string
  preferences: Preferences
}

/**
 * Export preferences to JSON string.
 * Includes version and timestamp for future migrations.
 */
export function exportPreferences(preferences: Preferences): string {
  const export_: PreferencesExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    preferences,
  }
  return JSON.stringify(export_, null, 2)
}

/**
 * Import preferences from JSON string.
 * Validates structure and returns only valid preferences.
 * Returns partial preferences (invalid fields are skipped).
 */
export function importPreferences(jsonString: string): {
  success: boolean
  preferences?: Partial<Preferences>
  error?: string
} {
  try {
    const data = JSON.parse(jsonString)

    // Validate has required structure
    if (!data || typeof data !== "object") {
      return {
        success: false,
        error: "Invalid JSON: expected an object",
      }
    }

    // Support both raw preferences and export format
    const preferencesToValidate =
      data.preferences !== undefined ? data.preferences : data

    // Validate and extract only valid preferences
    const result = preferencesSchema.safeParse(preferencesToValidate)

    if (!result.success) {
      // Partial import: extract valid fields
      const partial: Partial<Preferences> = {}

      if (preferencesToValidate.appearance !== undefined) {
        const appearanceResult = preferencesSchema.shape.appearance.safeParse(
          preferencesToValidate.appearance
        )
        if (appearanceResult.success) {
          partial.appearance = appearanceResult.data
        }
      }

      if (preferencesToValidate.language !== undefined) {
        const languageResult = preferencesSchema.shape.language.safeParse(
          preferencesToValidate.language
        )
        if (languageResult.success) {
          partial.language = languageResult.data
        }
      }

      if (preferencesToValidate.dateFormat !== undefined) {
        const dateFormatResult = preferencesSchema.shape.dateFormat.safeParse(
          preferencesToValidate.dateFormat
        )
        if (dateFormatResult.success) {
          partial.dateFormat = dateFormatResult.data
        }
      }

      if (preferencesToValidate.timeFormat !== undefined) {
        const timeFormatResult = preferencesSchema.shape.timeFormat.safeParse(
          preferencesToValidate.timeFormat
        )
        if (timeFormatResult.success) {
          partial.timeFormat = timeFormatResult.data
        }
      }

      // Only succeed if we got at least one valid preference
      if (Object.keys(partial).length > 0) {
        return { success: true, preferences: partial }
      }

      return {
        success: false,
        error: `Validation failed: ${result.error.message}`,
      }
    }

    return { success: true, preferences: result.data }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: `Failed to parse JSON: ${message}` }
  }
}

/**
 * Generate a filename for preferences export.
 * Format: preferences-YYYY-MM-DD-HHmmss.json
 */
export function generateExportFilename(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const seconds = String(now.getSeconds()).padStart(2, "0")

  return `preferences-${year}-${month}-${day}-${hours}${minutes}${seconds}.json`
}
