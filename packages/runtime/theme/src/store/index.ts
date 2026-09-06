// Scope store: moved to ../scope/ for better organization with provider pattern
export {
  createScopeStore as createThemeScopeStore,
  getScopeStorageKey as getThemeScopeStorageKey,
} from "../scope/scope-store"

export type {
  CreateScopeStoreOptions as CreateThemeScopeStoreOptions,
  ScopeActions as ThemeScopeActions,
  ScopeState as ThemeScopeState,
  ScopeStore as ThemeScopeStore,
  ScopeStoreApi as ThemeScopeStoreApi,
} from "../scope/scope-store"

export {
  useThemeStore,
  type ThemeState,
  type ThemeActions,
  type ThemeStore,
} from "./create-theme-store"
