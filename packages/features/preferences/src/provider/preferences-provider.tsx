"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react"
import type { StoreApi } from "zustand/vanilla"

import { createLocalStoragePreferencesAdapter } from "../persistence"
import type { PreferencesPersistenceAdapter } from "../persistence"
import { createPreferencesStore } from "../store"
import type { AppearancePreference, PreferencesState } from "../types"
import { DEFAULT_APPEARANCE_PREFERENCE } from "@repo/shared-contracts/defaults"

export interface PreferencesProviderProps {
  children: ReactNode
  adapter?: PreferencesPersistenceAdapter
  defaultPreference?: AppearancePreference
  initialPreference?: AppearancePreference
}

const PreferencesContext = createContext<StoreApi<PreferencesState> | null>(
  null
)

export function PreferencesProvider({
  adapter,
  children,
  defaultPreference = DEFAULT_APPEARANCE_PREFERENCE,
  initialPreference,
}: PreferencesProviderProps) {
  const defaultAdapterRef = useRef<PreferencesPersistenceAdapter | null>(null)
  if (defaultAdapterRef.current === null) {
    defaultAdapterRef.current = createLocalStoragePreferencesAdapter()
  }
  const activeAdapter = adapter ?? defaultAdapterRef.current

  const storeRef = useRef<StoreApi<PreferencesState> | null>(null)
  if (storeRef.current === null) {
    const preference =
      initialPreference ?? activeAdapter.read() ?? defaultPreference
    storeRef.current = createPreferencesStore(preference)
  }

  useEffect(() => {
    const store = storeRef.current as StoreApi<PreferencesState> | null
    if (store === null) return

    let applyingExternalPreference = false
    const unsubscribeStore = store.subscribe((state, previousState) => {
      if (
        !applyingExternalPreference &&
        state.appearancePreference !== previousState.appearancePreference
      ) {
        activeAdapter.write(state.appearancePreference)
      }
    })
    const unsubscribeAdapter = activeAdapter.subscribe((preference) => {
      applyingExternalPreference = true
      try {
        store.getState().setAppearancePreference(preference)
      } finally {
        applyingExternalPreference = false
      }
    })

    return () => {
      unsubscribeStore()
      unsubscribeAdapter()
    }
  }, [activeAdapter])

  return (
    <PreferencesContext.Provider value={storeRef.current}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferencesStore(): StoreApi<PreferencesState> {
  const store: StoreApi<PreferencesState> | null =
    useContext(PreferencesContext)
  if (store === null) {
    throw new Error(
      "usePreferencesStore must be used within a PreferencesProvider"
    )
  }
  return store
}
