// Store factory (for testing, or if building custom provider)
export { createScopeStore, getScopeStorageKey } from "./scope-store"
export type {
  ScopeStore,
  ScopeState,
  ScopeActions,
  ScopeStoreApi,
  CreateScopeStoreOptions,
} from "./scope-store"

// React integration (Provider + Hook)
export { ThemeScopeProvider } from "./scope-provider"
export type { ThemeScopeProviderProps } from "./scope-provider"

export { useThemeScope } from "./use-theme-scope"

export { useThemeCompilation } from "./use-theme-compilation"

// Context (advanced use only; prefer useThemeScope hook)
export { ScopeContext } from "./scope-context"
