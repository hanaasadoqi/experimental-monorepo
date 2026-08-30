// Appearance types (new, preferred)
export type {
  AppearancePreference,
  ResolvedColorScheme,
  AppearanceState,
} from "./types"

// Appearance provider and hooks (new, preferred)
export {
  AppearanceProvider,
  useAppearanceStore,
} from "./provider/appearance-provider"
export {
  useAppearance,
  useAppearancePreference,
  useResolvedColorScheme,
  useSetAppearancePreference,
  useAppearanceControl,
} from "./hooks/use-appearance"

// Persistence adapters (new, public)
export type { AppearancePersistenceAdapter } from "./persistence"
export {
  createLocalStorageAppearanceAdapter,
  createCookieAppearanceAdapter,
  type CookieAdapterOptions,
} from "./persistence"

// Runtime utilities (new, public)
//
// `synchronizeAppearance` and `createAppearanceStore` are deliberately NOT
// exported here: AppearanceProvider owns store creation and the
// synchronization lifecycle, so no consumer needs to call them. They remain
// reachable via the `./runtime` and `./store` subpaths for the package's own
// composition and for tests.
export {
  resolveColorScheme,
  getSystemColorScheme,
  applyColorScheme,
  getAppliedColorScheme,
  generateBootstrapScript,
  resolveServerColorScheme,
} from "./runtime"

/**
 * @deprecated Module-level store retained for backward compatibility.
 * Prefer `AppearanceProvider`, which owns an isolated store per tree.
 */
export { themeStore } from "./store/appearance-store"

// Theme compatibility (existing, preserved for backward compatibility)
export { useTheme } from "./hooks/use-theme"
export type { Theme, ThemeConfig, ThemeContextValue } from "./types"
export { ThemeProvider } from "./provider"
export { ThemeToggleHotkey } from "./components"
export { isTypingTarget } from "./utils"
