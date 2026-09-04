import { createStore, type Mutate, type StoreApi } from "zustand/vanilla"
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware"
import { ThemeOverrides } from "@repo/domain-theme"

const THEME_SCOPE_STORAGE_PREFIX = "synapcity:theme-scope:"

export function getThemeScopeStorageKey(scopeId: string): string {
  return `${THEME_SCOPE_STORAGE_PREFIX}${scopeId}`
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
  if (typeof value !== "object" || value === null || !("isDarkModeEnabled" in value)) {
    return undefined
  }

  const isDarkModeEnabled = value.isDarkModeEnabled
  return typeof isDarkModeEnabled === "boolean" ? isDarkModeEnabled : undefined
}

export interface ThemeScopeState {
  overrides: ThemeOverrides
  isDarkModeEnabled?: boolean
}

export interface ThemeScopeActions {
  setPrimaryColor: (primaryColor: string) => void
  setDarkMode: (isDarkMode: boolean | undefined) => void
}

export type ThemeScopeStore = ThemeScopeState & ThemeScopeActions

export type ThemeScopeStoreApi = Mutate<
  StoreApi<ThemeScopeStore>,
  [["zustand/persist", ThemeScopeState]]
>

export interface CreateThemeScopeStoreOptions {
  scopeId: string
  initialOverrides?: ThemeOverrides
  initialDarkMode?: boolean
  storage?: StateStorage
}

export function createThemeScopeStore({
  scopeId,
  initialOverrides = {},
  initialDarkMode,
  storage,
}: CreateThemeScopeStoreOptions): ThemeScopeStoreApi {
  return createStore<ThemeScopeStore>()(
    persist<ThemeScopeStore, [], [], ThemeScopeState>(
      (set) => ({
        overrides: initialOverrides,
        isDarkModeEnabled: initialDarkMode,
        setPrimaryColor: (primaryColor) => {
          set((state) => ({
            overrides: { ...state.overrides, primaryColor },
          }))
        },
        setDarkMode: (isDarkMode) => {
          set({ isDarkModeEnabled: isDarkMode })
        },
      }),
      {
        name: getThemeScopeStorageKey(scopeId),
        version: 2,
        storage: createJSONStorage(() => storage ?? localStorage),
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
