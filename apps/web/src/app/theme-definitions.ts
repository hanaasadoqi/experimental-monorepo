/**
 * Available themes for Synapcity
 *
 * Each theme defines:
 * - metadata: Display name and description
 * - enableDarkMode: Whether this theme supports dark mode
 * - Other theme properties (added as themes are defined)
 */

import type { ThemeDefinition } from "@repo/domain-theme"

export const AVAILABLE_THEMES: Record<string, ThemeDefinition> = {
  default: {
    version: "1.0.0",
    metadata: {
      name: "Default",
      description: "Default Synapcity theme with system appearance support",
    },
    enableDarkMode: true,
  },
}

export const DEFAULT_THEME_ID = "default"
