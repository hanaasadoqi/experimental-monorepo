/**
 * Theme Change Orchestration
 *
 * Handles the side effects when a theme is selected:
 * 1. Validate the theme exists
 * 2. Update any dependent state (e.g., recompile, sync DOM)
 * 3. Persist the selection
 *
 * This is intentionally separate from the registry to keep concerns distinct.
 */

import type { ThemeRegistryStoreState } from "./create-theme-registry-store"

export interface ThemeChangeOptions {
  persistSelectedTheme?: (themeId: string) => void
  onCompile?: (themeId: string) => void
}

/**
 * Change the active theme and trigger side effects.
 *
 * Usage:
 * ```typescript
 * changeTheme("dark", {
 *   persistSelectedTheme: (id) => localStorage.setItem("theme", id),
 *   onCompile: (id) => recompileAndApplyTheme(id)
 * })
 * ```
 */
export function changeTheme(
  themeId: string,
  state: ThemeRegistryStoreState,
  options?: ThemeChangeOptions
) {
  // Validate theme exists
  if (!state.hasTheme?.(themeId)) {
    throw new Error(`Theme "${themeId}" not found in registry`)
  }

  // Update selection in registry
  state.selectTheme?.(themeId)

  // Trigger side effects
  options?.onCompile?.(themeId)
  options?.persistSelectedTheme?.(themeId)
}

/**
 * Resolve and load a theme by ID from the registry.
 * Returns the theme definition if found, otherwise throws.
 */
export function getThemeById(themeId: string, state: ThemeRegistryStoreState) {
  const theme = state.getTheme?.(themeId)
  if (!theme) {
    throw new Error(`Theme "${themeId}" not found in registry`)
  }
  return theme
}
