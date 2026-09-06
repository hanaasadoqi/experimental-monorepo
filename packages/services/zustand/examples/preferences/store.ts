import { createStore } from "zustand/vanilla"
import { persist, createJSONStorage } from "zustand/middleware"
import { createSequentialMigration } from "@repo/services-zustand/persist"

export type AppearancePreference = "light" | "dark" | "system"
export interface PreferencesState {
  appearance: AppearancePreference
}
export interface PreferencesActions {
  setAppearance(value: AppearancePreference): void
  reset(): void
}
export type PreferencesStore = PreferencesState & PreferencesActions

const DEFAULTS: PreferencesState = { appearance: "system" }

const migrate = createSequentialMigration<PreferencesState>({
  1: (state) => {
    const old = state as { darkMode?: boolean }
    return { appearance: old.darkMode === true ? "dark" : "system" }
  },
})

export function createPreferencesStore(
  initial: Partial<PreferencesState> = {}
) {
  const initialState = { ...DEFAULTS, ...initial }
  return createStore<PreferencesStore>()(
    persist(
      (set) => ({
        ...initialState,
        setAppearance: (appearance) => set({ appearance }),
        reset: () => set(initialState),
      }),
      {
        name: "synapcity:preferences",
        version: 1,
        migrate,
        partialize: ({ appearance }) => ({ appearance }),
        storage: createJSONStorage(() => localStorage),
        skipHydration: true,
      }
    )
  )
}
