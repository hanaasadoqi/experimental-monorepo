"use client"

import { createScopeStore, type CreateScopeStoreOptions } from "./scope-store"
import { ScopeContext } from "./scope-context"
import { clearScopeBootstrapData } from "../adapters/scope-bootstrap"
import { useEffect, useState, type ReactNode } from "react"

export interface ThemeScopeProviderProps {
  /** Unique identifier for this scope */
  scopeId: string
  /** Initial color overrides */
  initialOverrides?: CreateScopeStoreOptions["initialOverrides"]
  /** Initial dark mode state */
  darkModeEnabled?: CreateScopeStoreOptions["darkModeEnabled"]
  /** Adapter: how to persist overrides. Default: localStorage */
  onOverridesChange?: CreateScopeStoreOptions["persistOverrides"]
  /** Adapter: how to persist dark mode. Default: localStorage */
  onDarkModeChange?: CreateScopeStoreOptions["persistDarkMode"]
  children: ReactNode
}

/**
 * Provider for scoped theme state and side effects.
 *
 * Handles:
 * - Creating isolated Zustand store per scopeId
 * - Rehydrating persisted state from storage (with skipHydration guard)
 * - Coordinating with adapters for persistence
 * - Providing store to child components via context
 *
 * Usage:
 * ```tsx
 * <ThemeScopeProvider
 *   scopeId="preview"
 *   onOverridesChange={(o) => console.log("overrides changed", o)}
 *   onDarkModeChange={(d) => console.log("dark mode changed", d)}
 * >
 *   <ScopedThemeToggle />
 *   <PreviewContent />
 * </ThemeScopeProvider>
 * ```
 *
 * Pattern (from beste-ui):
 * 1. Store factory is called once at mount, creating a stable store instance
 * 2. Adapters (persistence, DOM sync) are passed as dependencies
 * 3. useEffect rehydrates persisted state explicitly (skipHydration: true)
 * 4. Store is provided via context (no direct .getState() in components)
 * 5. Components use useThemeScope hook (not context directly)
 *
 * SSR/Hydration (FOUC prevention):
 * - This is a client-only component ("use client")
 * - Bootstrap script runs BEFORE React, reads localStorage, applies scope to DOM
 * - Bootstrap script stores initial scope state in window.__INITIAL_SCOPES__
 * - Provider rehydrates from bootstrap state + persisted storage
 * - Reconciliation: bootstrap state (from localStorage) is canonical; storage is merged
 * - Result: scope is applied before React renders, no FOUC
 */
export function ThemeScopeProvider({
  scopeId,
  initialOverrides,
  darkModeEnabled,
  onOverridesChange,
  onDarkModeChange,
  children,
}: ThemeScopeProviderProps) {
  // Create store once on mount, stable across re-renders
  const [store] = useState(() =>
    createScopeStore({
      scopeId,
      initialOverrides,
      darkModeEnabled,
      persistOverrides: onOverridesChange,
      persistDarkMode: onDarkModeChange,
    })
  )

  // Rehydrate persisted state from storage + bootstrap data
  // Bootstrap script (if present) already applied scope to DOM before React loaded
  // This effect syncs React store with what bootstrap did
  useEffect(() => {
    void store.persist.rehydrate()

    // Clear bootstrap data after hydration completes
    // (prevents accidental re-use if provider remounts)
    clearScopeBootstrapData()
  }, [store])

  return <ScopeContext.Provider value={store}>{children}</ScopeContext.Provider>
}
