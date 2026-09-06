"use client"

import { createScopeStore, type CreateScopeStoreOptions } from "./scope-store"
import { ScopeContext } from "./scope-context"
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
  /** Lazily injected environment storage. Omit for an in-memory scope. */
  getStorage?: CreateScopeStoreOptions["getStorage"]
  children: ReactNode
}

/**
 * Provider for scoped theme state and side effects.
 *
 * Handles:
 * - Creating isolated Zustand store per scopeId
 * - Rehydrating injected persisted state after hydration
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
 * This provider does not promise pre-paint local-storage restoration. A future
 * environment adapter may supply that behavior without duplicating runtime
 * state rules.
 */
export function ThemeScopeProvider({
  scopeId,
  initialOverrides,
  darkModeEnabled,
  onOverridesChange,
  onDarkModeChange,
  getStorage,
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
      getStorage,
    })
  )

  // Rehydrate persisted state from storage + bootstrap data
  // Bootstrap script (if present) already applied scope to DOM before React loaded
  // This effect syncs React store with what bootstrap did
  useEffect(() => {
    void store.persist.rehydrate()
  }, [store])

  return <ScopeContext.Provider value={store}>{children}</ScopeContext.Provider>
}
