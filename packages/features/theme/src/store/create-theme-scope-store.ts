import { createStore, type Mutate, type StoreApi } from "zustand/vanilla"
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware"

import type { ThemeOverrides } from "../model/colors"

export interface ThemeScopeState {
  overrides: ThemeOverrides
}

export interface ThemeScopeActions {
  setPrimaryColor: (primaryColor: string) => void
}

export type ThemeScopeStore = ThemeScopeState & ThemeScopeActions

export type ThemeScopeStoreApi = Mutate<
  StoreApi<ThemeScopeStore>,
  [["zustand/persist", ThemeScopeState]]
>

export interface CreateThemeScopeStoreOptions {
  scopeId: string
  initialOverrides?: ThemeOverrides
  storage?: StateStorage
}

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

export function createThemeScopeStore({
  scopeId,
  initialOverrides = {},
  storage,
}: CreateThemeScopeStoreOptions): ThemeScopeStoreApi {
  return createStore<ThemeScopeStore>()(
    persist<ThemeScopeStore, [], [], ThemeScopeState>(
      (set) => ({
        overrides: initialOverrides,
        setPrimaryColor: (primaryColor) => {
          set((state) => ({
            overrides: { ...state.overrides, primaryColor },
          }))
        },
      }),
      {
        name: getThemeScopeStorageKey(scopeId),
        version: 1,
        storage: createJSONStorage(() => storage ?? localStorage),
        partialize: ({ overrides }) => ({ overrides }),
        merge: (persistedState, currentState) => {
          const persistedOverrides = readPersistedOverrides(persistedState)

          return {
            ...currentState,
            overrides:
              persistedOverrides === undefined
                ? currentState.overrides
                : { ...currentState.overrides, ...persistedOverrides },
          }
        },
        skipHydration: true,
      }
    )
  )
}
