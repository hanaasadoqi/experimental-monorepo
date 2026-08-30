import { createStore } from "zustand/vanilla"
import type { StoreApi } from "zustand/vanilla"

import type { AppearancePreference, PreferencesState } from "../types"
import {
  DEFAULT_APPEARANCE_PREFERENCE,
  DEFAULT_PREFS_STATE,
} from "@repo/shared-contracts/defaults"

export function createPreferencesStore(
  initialPreference: AppearancePreference = DEFAULT_APPEARANCE_PREFERENCE
): StoreApi<PreferencesState> {
  return createStore<PreferencesState>()((set) => ({
    ...DEFAULT_PREFS_STATE,
    appearancePreference: initialPreference,
    setAppearancePreference: (appearancePreference) =>
      set({ appearancePreference }),
  }))
}
