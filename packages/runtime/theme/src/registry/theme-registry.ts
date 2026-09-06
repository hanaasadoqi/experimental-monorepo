/**
 * Theme Registry: Manages available themes and theme selection.
 *
 * Canonical single source of truth for:
 * - All available theme definitions
 * - Which theme is currently selected
 * - Theme lookup and resolution
 *
 * Intentionally pure (no persistence, no side effects) — adapters handle I/O.
 */

import type { ThemeDefinition } from "@repo/domain-theme"

export interface ThemeRegistryState {
  themes: Map<string, ThemeDefinition>
  selectedThemeId: string
}

export interface ThemeRegistry {
  state: ThemeRegistryState

  // Queries
  getTheme: (id: string) => ThemeDefinition | undefined
  getSelectedTheme: () => ThemeDefinition | undefined
  listThemes: () => ThemeDefinition[]
  hasTheme: (id: string) => boolean

  // Mutations
  registerTheme: (id: string, theme: ThemeDefinition) => void
  selectTheme: (id: string) => void
  registerThemes: (themes: Record<string, ThemeDefinition>) => void
}

/**
 * Create an in-memory theme registry.
 * Typically used as the foundation for a persistent store.
 */
export function createThemeRegistry(
  initialThemes: Record<string, ThemeDefinition> = {},
  initialSelectedId?: string
): ThemeRegistry {
  const themes = new Map(Object.entries(initialThemes))
  let selectedThemeId =
    initialSelectedId &&
    themes.has(initialSelectedId)
      ? initialSelectedId
      : Array.from(themes.keys())[0] || "default"

  return {
    state: {
      themes,
      selectedThemeId,
    },

    getTheme: (id: string) => themes.get(id),

    getSelectedTheme: () => themes.get(selectedThemeId),

    listThemes: () => Array.from(themes.values()),

    hasTheme: (id: string) => themes.has(id),

    registerTheme: (id: string, theme: ThemeDefinition) => {
      themes.set(id, theme)
    },

    selectTheme: (id: string) => {
      if (!themes.has(id)) {
        throw new Error(`Theme "${id}" not found in registry`)
      }
      selectedThemeId = id
    },

    registerThemes: (newThemes: Record<string, ThemeDefinition>) => {
      Object.entries(newThemes).forEach(([id, theme]) => {
        themes.set(id, theme)
      })
    },
  }
}
