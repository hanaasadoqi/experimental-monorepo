"use client"

import { useEffect, useRef, type ReactNode } from "react"
import type { StoreApi } from "zustand"

import type { AppearancePersistenceAdapter } from "../persistence"
import { synchronizeAppearance } from "../runtime"
import { createAppearanceStore } from "../store"
import type { AppearancePreference, AppearanceState } from "../types"
import { AppearanceContext } from "./appearance-provider"

const runtimeAdapter: AppearancePersistenceAdapter = {
  read: () => null,
  write: () => undefined,
  subscribe: () => () => undefined,
}

export interface AppearanceRuntimeProviderProps {
  children: ReactNode
  preference: AppearancePreference
  onPreferenceChange?(preference: AppearancePreference): void
}

export function AppearanceRuntimeProvider({
  children,
  onPreferenceChange,
  preference,
}: AppearanceRuntimeProviderProps) {
  const onPreferenceChangeRef = useRef(onPreferenceChange)
  onPreferenceChangeRef.current = onPreferenceChange

  const storeRef = useRef<StoreApi<AppearanceState> | null>(null)
  if (storeRef.current === null) {
    const store = createAppearanceStore(preference)
    const setRuntimePreference = store.getState().setPreference
    store.setState({
      setPreference(nextPreference) {
        setRuntimePreference(nextPreference)
        onPreferenceChangeRef.current?.(nextPreference)
      },
    })
    storeRef.current = store
  }

  useEffect(() => {
    const store = storeRef.current
    if (store === null) return
    return synchronizeAppearance(
      store,
      runtimeAdapter,
      document.documentElement
    )
  }, [])

  useEffect(() => {
    const store = storeRef.current
    if (store === null || store.getState().preference === preference) return
    store.setState({ preference })
  }, [preference])

  return (
    <AppearanceContext.Provider value={storeRef.current}>
      {children}
    </AppearanceContext.Provider>
  )
}
