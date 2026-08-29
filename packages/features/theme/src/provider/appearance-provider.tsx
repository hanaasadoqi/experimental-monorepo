import React, { ReactNode, createContext, useEffect, useRef } from "react"
import { StoreApi } from "zustand"
import { AppearanceState, AppearancePreference } from "../types"
import { createAppearanceStore } from "../store/appearance-store"
import { AppearancePersistenceAdapter } from "../persistence"
import { synchronizeAppearance } from "../runtime"

export interface AppearanceProviderProps {
  children: ReactNode
  adapter: AppearancePersistenceAdapter
  defaultPreference?: AppearancePreference
  initialPreference?: AppearancePreference
}

/**
 * Context carrying the Appearance store for this provider tree.
 */
export const AppearanceContext =
  createContext<StoreApi<AppearanceState> | null>(null)

/**
 * Provider that owns an isolated Appearance store and its lifecycle.
 */
export function AppearanceProvider({
  children,
  adapter,
  defaultPreference = "system",
  initialPreference,
}: AppearanceProviderProps) {
  const storeRef = useRef<StoreApi<AppearanceState> | null>(null)
  const disposerRef = useRef<(() => void) | null>(null)

  // Create or retrieve store (once per provider instance)
  if (!storeRef.current) {
    const persistedPreference = adapter.read() || undefined
    const effectivePreference =
      initialPreference || persistedPreference || defaultPreference

    storeRef.current = createAppearanceStore(
      effectivePreference,
      "light" // systemScheme will be resolved at runtime
    )
  }

  // Setup synchronization on mount
  useEffect(() => {
    const store = storeRef.current
    if (!store) return

    const root = document.documentElement
    disposerRef.current = synchronizeAppearance(store, adapter, root)

    // Cleanup on unmount (Strict Mode safe)
    return () => {
      disposerRef.current?.()
      disposerRef.current = null
    }
  }, [adapter])

  return (
    <AppearanceContext.Provider value={storeRef.current}>
      {children}
    </AppearanceContext.Provider>
  )
}

/**
 * Hook to access the Appearance store from context.
 * @throws if used outside AppearanceProvider
 */
export function useAppearanceStore(): StoreApi<AppearanceState> {
  const store = React.useContext(AppearanceContext)
  if (!store) {
    throw new Error(
      "useAppearanceStore must be used within an AppearanceProvider"
    )
  }
  return store
}
