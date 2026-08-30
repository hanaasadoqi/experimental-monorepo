"use client"

import { useCallback, useSyncExternalStore } from "react"

import { usePreferencesStore } from "../provider"
import type { AppearancePreference, PreferencesState } from "../types"

export function usePreferences(): PreferencesState {
  const store = usePreferencesStore()
  return useSyncExternalStore(store.subscribe, store.getState, store.getState)
}

export function useAppearancePreference(): AppearancePreference {
  const store = usePreferencesStore()
  return useSyncExternalStore(
    (listener) =>
      store.subscribe((state, previousState) => {
        if (state.appearancePreference !== previousState.appearancePreference) {
          listener()
        }
      }),
    () => store.getState().appearancePreference,
    () => store.getState().appearancePreference
  )
}

export function useSetAppearancePreference(): (
  preference: AppearancePreference
) => void {
  const store = usePreferencesStore()
  return useCallback(
    (preference: AppearancePreference) => {
      store.getState().setAppearancePreference(preference)
    },
    [store]
  )
}
