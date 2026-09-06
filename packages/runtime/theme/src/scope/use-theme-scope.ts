"use client"

import { useContext, useSyncExternalStore } from "react"
import { ScopeContext } from "./scope-context"
import type { ScopeStore } from "./scope-store"

/**
 * Custom hook to access scoped theme store state and actions.
 *
 * Must be used within a ThemeScopeProvider.
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { isDarkMode, setDarkMode, overrides, setPrimaryColor } = useThemeScope()
 *   return (
 *     <button onClick={() => setDarkMode(!isDarkMode)}>
 *       Toggle: {isDarkMode ? "dark" : "light"}
 *     </button>
 *   )
 * }
 * ```
 *
 * Pattern: Uses useSyncExternalStore to subscribe to Zustand store changes.
 * This ensures the component re-renders when store state updates, and does NOT
 * capture stale closures (unlike bare useContext + .getState()).
 */
export function useThemeScope(scopeId?: string): ScopeStore {
  const store = useContext(ScopeContext)

  if (!store) {
    throw new Error(
      "useThemeScope must be used within a <ThemeScopeProvider>. " +
        'Wrap your component tree with <ThemeScopeProvider scopeId="..."> first.'
    )
  }

  // Subscribe to all store changes; re-render when state updates
  const state = useSyncExternalStore(

    (callback) => {
      // Subscribe to store changes; Zustand returns unsubscribe function
      return store.subscribe(callback)
    },
    () => store.getState(), // Server render snapshot (won't change)
    () => store.getState() // Hydration snapshot (used on client before subscribe fires)
  )

  return state
}
