import { createStore, type StoreApi } from "zustand/vanilla"

import {
  DEFAULT_PREFERENCES,
  type AppearancePreference,
  type Preferences,
} from "../model"

import type { PreferencesStore } from "./types"

export interface CreatePreferencesStoreOptions {
  initialState?: Partial<Preferences>
}

export type PreferencesStoreApi = StoreApi<PreferencesStore>

export function createPreferencesStore({
  initialState,
}: CreatePreferencesStoreOptions = {}): PreferencesStoreApi {
  const initialPreferences: Preferences = {
    ...DEFAULT_PREFERENCES,
    ...initialState,
  }

  return createStore<PreferencesStore>()((set) => ({
    ...initialPreferences,

    setAppearance: (appearance: AppearancePreference) => {
      set({ appearance })
    },
  }))
}

/**@example initializaion
 *
 * createPreferencesStore({
 *  initialState: {
 *    appearance: initialAppearance,
 *  }
 * });
 */
