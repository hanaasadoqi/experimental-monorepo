//  * Validators for persisted scope state.
//  * Extracts and validates individual fields from storage with safe fallbacks.
//  * Handles both current keys and legacy keys for backward compatibility.

import type { ThemeOverrides, PrimaryThemeColor } from "@repo/domain-theme"

//  */
export const ScopePersistenceValidators = {
  /**
   * Extract and validate persisted overrides with safe fallbacks.
   * Returns undefined if overrides field is missing or invalid (corrupt storage).
   * Returns empty object if primary field is missing (graceful degradation).
   */
  readOverrides: (value: unknown): ThemeOverrides | undefined => {
    if (
      typeof value !== "object" ||
      value === null ||
      !("overrides" in value)
    ) {
      return undefined
    }

    const overrides = value.overrides
    if (typeof overrides !== "object" || overrides === null) {
      return undefined
    }

    if (!("primary" in overrides)) {
      return {}
    }

    // primary field can be an oklch string or color object from the domain schema
    if (
      typeof overrides.primary === "string" ||
      (typeof overrides.primary === "object" && overrides.primary !== null)
    ) {
      return { primary: overrides.primary as unknown as PrimaryThemeColor }
    }
    return {}
  },

  /**
   * Extract and validate persisted dark mode state.
   * Handles BOTH current key (isDarkMode) and legacy key (isDarkModeEnabled).
   * Returns boolean if valid, undefined if missing or invalid.
   */
  readDarkMode: (value: unknown): boolean | undefined => {
    if (typeof value !== "object" || value === null) return undefined
    const persisted = value as {
      isDarkMode?: unknown
      isDarkModeEnabled?: unknown
    }
    const isDarkMode = persisted.isDarkMode ?? persisted.isDarkModeEnabled
    return typeof isDarkMode === "boolean" ? isDarkMode : undefined
  },

  /**
   * Extract and validate persisted dark mode preference.
   * Returns boolean if valid, undefined if missing or invalid.
   */
  readEnableDarkMode: (value: unknown): boolean | undefined => {
    if (
      typeof value !== "object" ||
      value === null ||
      !("enableDarkMode" in value)
    ) {
      return undefined
    }

    return typeof value.enableDarkMode === "boolean"
      ? value.enableDarkMode
      : undefined
  },

  /**
   * Extract and validate persisted theme ID.
   * Ensures id is a non-empty string; returns undefined if missing or invalid.
   */
  readThemeId: (value: unknown): string | undefined => {
    if (typeof value !== "object" || value === null || !("id" in value)) {
      return undefined
    }

    return typeof value.id === "string" && value.id.length > 0
      ? value.id
      : undefined
  },
} as const
