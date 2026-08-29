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
export {
  resolveColorScheme,
  getSystemColorScheme,
  applyColorScheme,
  getAppliedColorScheme,
  synchronizeAppearance,
  generateBootstrapScript,
  resolveServerColorScheme,
} from "./runtime"

// Store factory (new, public, for advanced use)
export { createAppearanceStore, themeStore } from "./store/appearance-store"

// Theme compatibility (existing, preserved for backward compatibility)
export { useTheme } from "./hooks/use-theme"
export type { Theme, ThemeConfig, ThemeContextValue } from "./types"
export { ThemeProvider } from "./provider"
export { ThemeToggleHotkey } from "./components"
export { isTypingTarget } from "./utils"
