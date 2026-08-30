"use client"

import { useCallback, useContext, useSyncExternalStore } from "react"

import { usePreferencesStore as globalStore, usePreferencesStore } from "../store/preferences-store"
import { PreferencesContext } from "../provider/preferences-provider"
import type { AppearancePreference, PreferencesState } from "../types"

function getStore() {
  // This will only work in client components, but the hooks are marked "use client"
  // We can't use useContext here since it's not in a component, so we default to global
  return globalStore
}

export function usePreferences(): PreferencesState {
  const _store = useContext(PreferencesContext) || getStore()
  return useSyncExternalStore(
    (listener) => usePreferencesStore.subscribe(listener),
    () => usePreferencesStore.getState(),
    () => usePreferencesStore.getState()
  )
}

export function useAppearancePreference(): AppearancePreference {
  const _store = useContext(PreferencesContext) || getStore()
  return useSyncExternalStore(
    (listener) =>
      usePreferencesStore.subscribe?.(
        (
          state: Partial<PreferencesState>,
          previousState: Partial<PreferencesState>
        ) => {
          if (state.appearance !== previousState.appearance) {
            listener()
          }
        }
      ),
    () => usePreferencesStore.getState().appearance,
    () => usePreferencesStore.getState().appearance
  )
}

export function useSetAppearancePreference(): (
  preference: AppearancePreference
) => void {
  const store = useContext(PreferencesContext) || getStore()
  return useCallback(
    (preference: AppearancePreference) => {
      usePreferencesStore.getState().setAppearance(preference)
    },
    [store]
  )
}
