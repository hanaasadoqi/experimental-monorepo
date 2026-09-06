/**
 * Available themes for Synapcity
 *
 * Each theme defines:
 * - version: Semantic version
 * - metadata: Display name and description
 * - colors: Primary, accent, and harmony for color derivation
 * - darkMode: Dark mode settings
 */

import type { ThemeDefinition } from "@repo/domain-theme"
import { DEFAULT_PRIMARY_COLOR } from "@repo/domain-theme/colors"

export const AVAILABLE_THEMES: Record<string, ThemeDefinition> = {
  default: {
    version: "1.0.0",
    metadata: {
      name: "Default",
      description: "Default Synapcity theme with system appearance support",
    },
    colors: {
      primary: DEFAULT_PRIMARY_COLOR,
    },
    darkMode: {
      isDarkMode: undefined,
    },
  },
}

export const DEFAULT_THEME_ID = "default"
