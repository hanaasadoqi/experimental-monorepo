/**
 * Theme Selection: Manages which theme is active in a scope.
 *
 * Separates the concern of "which theme to use" from "what are the theme's properties".
 * Allows multiple scopes to have different themes active simultaneously.
 */

import type { ThemeDefinition } from "@repo/domain-theme"

export interface ThemeSelection {
  themeId: string
  theme: ThemeDefinition
}

/**
 * Resolve which theme to use for a scope.
 * Simple for now, but allows for complex logic later:
 * - User preferences
 * - Device capabilities
 * - Time of day
 * - Context-specific defaults
 */
export function resolveThemeSelection(
  preferredThemeId: string | undefined,
  availableThemes: Map<string, ThemeDefinition>,
  fallbackThemeId: string = "default"
): ThemeSelection {
  const themeId = preferredThemeId ?? fallbackThemeId
  const theme =
    availableThemes.get(themeId) ||
    availableThemes.get(fallbackThemeId) ||
    availableThemes.values().next().value

  if (!theme) {
    throw new Error("No themes available in registry")
  }

  return { themeId, theme }
}
