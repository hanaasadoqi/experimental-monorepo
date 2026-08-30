import React, { ReactNode, createContext, useEffect, useRef } from "react"
import { StoreApi } from "zustand"
import { AppearanceState, AppearancePreference } from "../types"
import { createAppearanceStore } from "../store/appearance-store"
import {
  AppearancePersistenceAdapter,
  createLocalStorageAppearanceAdapter,
} from "../persistence"
import { synchronizeAppearance } from "../runtime"

export interface AppearanceProviderProps {
  children: ReactNode
  /**
   * Persistence adapter used to read and write the stored preference.
   * Defaults to a `localStorage`-backed adapter, so the provider works
   * without any wiring from the consumer.
   */
  adapter?: AppearancePersistenceAdapter
  defaultPreference?: AppearancePreference
  initialPreference?: AppearancePreference
}

/**
 * Context carrying the Appearance store for this provider tree.
 *
 * @internal Consumers should use `useAppearance` and the other hooks in
 * `hooks/use-appearance` rather than reading this context directly.
 */
export const AppearanceContext =
  createContext<StoreApi<AppearanceState> | null>(null)

/**
 * The single entry point to the Appearance feature.
 *
 * The provider owns the entire lifecycle, so consumers never call the
 * internals themselves:
 *
 * 1. Creates one isolated store per provider instance, seeded from
 *    `initialPreference` (server-rendered), then the persisted value, then
 *    `defaultPreference`.
 * 2. Mounts `synchronizeAppearance`, which is the sole writer of the DOM
 *    color scheme and the sole caller of the persistence adapter.
 * 3. Disposes every subscription on unmount (React Strict Mode safe).
 *
 * `store/`, `runtime/`, and `persistence/` are internals of this module;
 * `AppearanceProvider` plus the `use*` hooks are its public boundary.
 */
export function AppearanceProvider({
  children,
  adapter,
  defaultPreference = "system",
  initialPreference,
}: AppearanceProviderProps) {
  const fallbackAdapterRef = useRef<AppearancePersistenceAdapter | null>(null)
  if (fallbackAdapterRef.current === null) {
    fallbackAdapterRef.current = createLocalStorageAppearanceAdapter()
  }
  const activeAdapter = adapter ?? fallbackAdapterRef.current

  const storeRef = useRef<StoreApi<AppearanceState> | null>(null)
  const disposerRef = useRef<(() => void) | null>(null)

  // Create the store once per provider instance.
  if (!storeRef.current) {
    const persistedPreference = activeAdapter.read() || undefined
    const effectivePreference =
      initialPreference || persistedPreference || defaultPreference

    storeRef.current = createAppearanceStore(
      effectivePreference,
      "light" // systemScheme is corrected by synchronizeAppearance on mount
    )
  }

  // Own the synchronization lifecycle: DOM, system media query, persistence.
  useEffect(() => {
    const store = storeRef.current
    if (!store) return

    const root = document.documentElement
    disposerRef.current = synchronizeAppearance(store, activeAdapter, root)

    return () => {
      disposerRef.current?.()
      disposerRef.current = null
    }
  }, [activeAdapter])

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
