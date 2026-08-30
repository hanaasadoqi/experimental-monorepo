import { create, type StoreApi } from "zustand"

import type { AppearancePreference, PreferencesState } from "../types"
import { DEFAULT_APPEARANCE_PREFERENCE } from "@repo/shared-contracts/defaults"

export type PreferencesActions = {
  setAppearance: (appearance: AppearancePreference) => void
  toggleAppearance?: () => void
}

export type PreferencesStore = PreferencesState & PreferencesActions

export function createPreferencesStore(
  initialAppearance?: AppearancePreference
): StoreApi<PreferencesStore> {
  return create<PreferencesStore>((set, get) => ({
    appearance: initialAppearance ?? DEFAULT_APPEARANCE_PREFERENCE,
    setAppearance: (pref: AppearancePreference) => set({ appearance: pref }),
    toggleAppearance: () => {
      const currentAppearance = get().appearance
      const newAppearance = currentAppearance === "light" ? "dark" : "light"
      get().setAppearance(newAppearance)
    },
  }))
}

export const usePreferencesStore = createPreferencesStore()
