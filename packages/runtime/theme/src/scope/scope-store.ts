import { createStore, type Mutate, type StoreApi } from "zustand/vanilla"
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware"
import { ThemeOverrides } from "@repo/domain-theme"

const SCOPE_STORAGE_PREFIX = "synapcity:scope:"

export function getScopeStorageKey(scopeId: string): string {
  return `${SCOPE_STORAGE_PREFIX}${scopeId}`
}

function readPersistedOverrides(value: unknown): ThemeOverrides | undefined {
  if (typeof value !== "object" || value === null || !("overrides" in value)) {
    return undefined
  }

  const overrides = value.overrides
  if (typeof overrides !== "object" || overrides === null) {
    return undefined
  }

  if (!("primaryColor" in overrides)) {
    return {}
  }

  return typeof overrides.primaryColor === "string"
    ? { primaryColor: overrides.primaryColor }
    : undefined
}

function readPersistedDarkMode(value: unknown): boolean | undefined {
  if (
    typeof value !== "object" ||
    value === null ||
    !("isDarkModeEnabled" in value)
  ) {
    return undefined
  }

  const isDarkModeEnabled = value.isDarkModeEnabled
  return typeof isDarkModeEnabled === "boolean" ? isDarkModeEnabled : undefined
}

export interface ScopeState {
  scopeId: string
  overrides: ThemeOverrides
  isDarkModeEnabled?: boolean
}

export interface ScopeActions {
  setPrimaryColor: (primaryColor: string) => void
  setDarkMode: (isDarkMode: boolean | undefined) => void
}

export type ScopeStore = ScopeState & ScopeActions

export type ScopeStoreApi = Mutate<
  StoreApi<ScopeStore>,
  [["zustand/persist", Omit<ScopeState, "scopeId">]]
>

/**
 * Dependency injection options for scope store.
 * Adapters are injected at creation time, keeping the store pure.
 */
export interface CreateScopeStoreOptions {
  scopeId: string
  initialOverrides?: ThemeOverrides
  darkModeEnabled?: boolean
  /**
   * Called when overrides change. Adapter receives the overrides to persist.
   * Examples: localStorage write, cookie write, API call
   */
  persistOverrides?: (overrides: ThemeOverrides) => void | Promise<void>
  /**
   * Called when dark mode preference changes. Adapter receives the dark mode state.
   */
  persistDarkMode?: (isDarkMode: boolean | undefined) => void | Promise<void>
  /** Explicit storage implementation, primarily for tests and non-lazy use. */
  storage?: StateStorage
  /** Lazily resolve storage at hydration time without importing browser APIs. */
  getStorage?: () => StateStorage | undefined
}

function createDeferredStorage(
  getStorage: () => StateStorage | undefined
): StateStorage {
  return {
    getItem: (name) => getStorage()?.getItem(name) ?? null,
    setItem: (name, value) => getStorage()?.setItem(name, value),
    removeItem: (name) => getStorage()?.removeItem(name),
  }
}

/**
 * Create an isolated scope theme store with dependency-injected persistence.
 *
 * Usage:
 * ```ts
 * const store = createScopeStore({
 *   scopeId: "preview",
 *   getStorage: () => environmentStorage,
 * })
 * ```
 *
 * Pattern: Zustand store factory with explicit dependency injection.
 * This allows the store to remain pure (no localStorage/DOM knowledge) while
 * adapters control how persistence actually happens.
 */
export function createScopeStore({
  scopeId,
  initialOverrides = {},
  darkModeEnabled,
  persistOverrides,
  persistDarkMode,
  storage,
  getStorage,
}: CreateScopeStoreOptions): ScopeStoreApi {
  return createStore<ScopeStore>()(
    persist<ScopeStore, [], [], Omit<ScopeState, "scopeId">>(
      (set) => ({
        scopeId,
        overrides: initialOverrides,
        isDarkModeEnabled: darkModeEnabled,
        setPrimaryColor: (primaryColor) => {
          set((state) => {
            const newOverrides = { ...state.overrides, primaryColor }
            persistOverrides?.(newOverrides)
            return { overrides: newOverrides }
          })
        },
        setDarkMode: (isDarkMode) => {
          set(() => {
            persistDarkMode?.(isDarkMode)
            return { isDarkModeEnabled: isDarkMode }
          })
        },
      }),
      {
        name: getScopeStorageKey(scopeId),
        version: 1,
        storage: createJSONStorage(
          () => storage ?? createDeferredStorage(() => getStorage?.())
        ),
        partialize: ({ overrides, isDarkModeEnabled }) => ({
          overrides,
          ...(isDarkModeEnabled !== undefined && { isDarkModeEnabled }),
        }),
        merge: (persistedState, currentState) => {
          const persistedOverrides = readPersistedOverrides(persistedState)
          const persistedDarkMode = readPersistedDarkMode(persistedState)

          return {
            ...currentState,
            overrides:
              persistedOverrides === undefined
                ? currentState.overrides
                : { ...currentState.overrides, ...persistedOverrides },
            isDarkModeEnabled:
              persistedDarkMode === undefined
                ? currentState.isDarkModeEnabled
                : persistedDarkMode,
          }
        },
        skipHydration: true,
      }
    )
  )
}
