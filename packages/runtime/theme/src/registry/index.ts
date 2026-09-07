/**
 * Theme Registry API: Manage available themes and selection.
 *
 * Canonical architecture for theme management:
 * - Registry: stores all available theme definitions (pure, no side effects)
 * - Selection: resolves which theme is active given preferences
 * - RegistryStore: Zustand wrapper for reactive state management
 * - Context/Hook: Provide registry access to React components
 *
 * Usage:
 * ```typescript
 * // Pure registry (in setup code)
 * const registry = createThemeRegistry(
 *   {
 *     light: { version: "1.0.0", metadata: { name: "Light" }, ... },
 *     dark: { version: "1.0.0", metadata: { name: "Dark" }, ... },
 *   },
 *   "light"  // selected by default
 * )
 *
 * // Reactive store (in React)
 * <ThemeRegistryProvider initialThemes={...}>
 *   <ThemeSwitcher />
 * </ThemeRegistryProvider>
 *
 * function ThemeSwitcher() {
 *   const { selectedThemeId, selectTheme } = useThemeRegistry()
 *   return <button onClick={() => selectTheme("dark")}>Dark</button>
 * }
 * ```
 */

export {
  createThemeRegistry,
  type ThemeRegistry,
  type ThemeRegistryState,
} from "./theme-registry"
export { resolveThemeSelection, type ThemeSelection } from "./theme-selection"
export {
  createThemeRegistryStore,
  type ThemeRegistryStoreState,
} from "./create-theme-registry-store"
export {
  ThemeRegistryProvider,
  useThemeRegistry,
  type ThemeRegistryProviderProps,
} from "./theme-registry-context"
export {
  changeTheme,
  getThemeById,
  type ThemeChangeOptions,
} from "./change-theme"
