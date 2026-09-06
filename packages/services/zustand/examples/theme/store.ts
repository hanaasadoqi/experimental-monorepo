import { createStore } from "zustand/vanilla"
import { persist, createJSONStorage } from "zustand/middleware"
import { createSequentialMigration } from "@repo/services-zustand/persist"

export interface ThemeOverrides {
  primaryColor?: string
}
export interface ThemeScopeState {
  overrides: ThemeOverrides
}
export interface ThemeScopeActions {
  setPrimaryColor(value: string): void
  resetOverrides(): void
}
export type ThemeScopeStore = ThemeScopeState & ThemeScopeActions

const migrate = createSequentialMigration<ThemeScopeState>({
  1: (state) => {
    const old = state as { primaryColor?: string }
    return {
      overrides: old.primaryColor ? { primaryColor: old.primaryColor } : {},
    }
  },
})

export function createThemeScopeStore(
  scopeId: string,
  initial: ThemeOverrides = {}
) {
  return createStore<ThemeScopeStore>()(
    persist(
      (set) => ({
        overrides: initial,
        setPrimaryColor: (primaryColor) => {
          set((state) => ({
            overrides: { ...state.overrides, primaryColor },
          }))
        },
        resetOverrides: () => set({ overrides: initial }),
      }),
      {
        name: `synapcity:theme-scope:${scopeId}`,
        version: 1,
        migrate,
        partialize: ({ overrides }) => ({ overrides }),
        storage: createJSONStorage(() => localStorage),
        skipHydration: true,
      }
    )
  )
}
