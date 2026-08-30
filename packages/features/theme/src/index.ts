// =============================================================================
// CANONICAL API — Appearance
//
// `AppearanceProvider` plus the `use*` hooks are the supported way to read and
// change appearance. The provider owns the whole lifecycle: store creation,
// persistence, the system media query, and DOM application.
//
// See `.docs/guides/appearance-api.md` for the full guide.
// =============================================================================

// Types
export type {
  AppearancePreference,
  ResolvedColorScheme,
  AppearanceState,
} from "./types"

// Provider
export {
  AppearanceProvider,
  useAppearanceStore,
} from "./provider/appearance-provider"

// Convenience wrapper: AppearanceProvider + bootstrap script + hotkey
export { ThemeWrapper } from "./components"

// Hooks
export {
  useAppearance,
  useAppearancePreference,
  useResolvedColorScheme,
  useSetAppearancePreference,
  useAppearanceControl,
} from "./hooks/use-appearance"

// Persistence adapters
export type { AppearancePersistenceAdapter } from "./persistence"
export {
  createLocalStorageAppearanceAdapter,
  createCookieAppearanceAdapter,
  type CookieAdapterOptions,
} from "./persistence"

// Runtime utilities
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
  generateBootstrapCode,
  generateBootstrapScript,
  resolveServerColorScheme,
} from "./runtime"

// Supporting utilities
export { ThemeToggleHotkey } from "./components"
export { isTypingTarget } from "./utils"

// =============================================================================
// DEPRECATED COMPATIBILITY SHIMS — Theme
//
// Everything below forwards to the canonical Appearance API above and is
// scheduled for removal in v2.0. Each symbol carries an `@deprecated` tag at
// its declaration site, so editors surface the warning at every call site.
//
//   ThemeProvider  → AppearanceProvider
//   useTheme()     → useAppearance()
//   themeStore     → AppearanceProvider's per-tree store
//   Theme          → AppearancePreference
//
// Migration guide: README.md § Migration Guide
// =============================================================================

/**
 * @deprecated Use `AppearanceProvider`, which owns an isolated store per tree.
 * This module-level singleton is shared process-wide. Removed in v2.0.
 */
export { themeStore } from "./store/appearance-store"

export { useTheme } from "./hooks/use-theme"
export { ThemeProvider } from "./provider"
export type { Theme, ThemeConfig, ThemeContextValue } from "./types"
