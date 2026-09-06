/**
 * Theme Registry API: Manage available themes and selection.
 *
 * Canonical architecture for theme management:
 * - Registry: stores all available theme definitions
 * - Selection: determines which theme is active
 * - Scope: stores theme-specific state (overrides, dark mode) per scope
 *
 * Usage:
 * ```typescript
 * const registry = createThemeRegistry(
 *   {
 *     light: { version: "1.0.0", metadata: { name: "Light" }, ... },
 *     dark: { version: "1.0.0", metadata: { name: "Dark" }, ... },
 *   },
 *   "light"  // selected by default
 * )
 *
 * registry.selectTheme("dark")
 * const current = registry.getSelectedTheme()
 * ```
 */

export { createThemeRegistry, type ThemeRegistry, type ThemeRegistryState } from "./theme-registry"
export { resolveThemeSelection, type ThemeSelection } from "./theme-selection"
