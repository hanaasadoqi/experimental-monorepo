/**
 * Browser storage adapter for scoped theme overrides.
 *
 * Handles reading/writing scope state to localStorage.
 * This adapter is injected into the scope store factory.
 */

import { getScopeStorageKey } from "../scope/scope-store"
import type { ThemeOverrides } from "@repo/domain-theme"
import type { StateStorage } from "zustand/middleware"

/**
 * Persist scope color overrides to localStorage.
 *
 * Usage:
 * ```ts
 * const store = createScopeStore({
 *   scopeId: "preview",
 *   persistOverrides: persistScopeOverridesToStorage,
 * })
 * ```
 */
export function persistScopeOverridesToStorage(
  overrides: ThemeOverrides,
  storage: StateStorage
): void {
  try {
    const key = getScopeStorageKey("preview") // Use the scope ID from context
    const current = storage.getItem(key)
    if (current instanceof Promise) return
    const parsed = current ? JSON.parse(current) : {}
    void storage.setItem(
      key,
      JSON.stringify({
        ...parsed,
        state: { ...parsed.state, overrides },
      })
    )
  } catch (error) {
    console.error("Failed to persist scope overrides:", error)
  }
}

/**
 * Persist scope dark mode preference to localStorage.
 *
 * Usage:
 * ```ts
 * const store = createScopeStore({
 *   scopeId: "preview",
 *   persistDarkMode: persistScopeDarkModeToStorage,
 * })
 * ```
 */
export function persistScopeDarkModeToStorage(
  isDarkMode: boolean | undefined,
  storage: StateStorage
): void {
  try {
    const key = getScopeStorageKey("preview") // Use the scope ID from context
    const current = storage.getItem(key)
    if (current instanceof Promise) return
    const parsed = current ? JSON.parse(current) : {}
    void storage.setItem(
      key,
      JSON.stringify({
        ...parsed,
        state: {
          ...parsed.state,
          isDarkModeEnabled: isDarkMode,
        },
      })
    )
  } catch (error) {
    console.error("Failed to persist scope dark mode:", error)
  }
}

/**
 * Factory for creating scope-specific storage adapters.
 *
 * Each scope gets its own storage key and adapter functions.
 *
 * Usage (in provider):
 * ```ts
 * const adapters = createScopeStorageAdapters(scopeId);
 * const store = createScopeStore({
 *   scopeId,
 *   persistOverrides: adapters.persistOverrides,
 *   persistDarkMode: adapters.persistDarkMode,
 * })
 * ```
 */
export function createScopeStorageAdapters(
  scopeId: string,
  storage: StateStorage
) {
  return {
    persistOverrides: (overrides: ThemeOverrides) => {
      try {
        const key = getScopeStorageKey(scopeId)
        const current = storage.getItem(key)
        if (current instanceof Promise) return
        const parsed = current ? JSON.parse(current) : {}
        void storage.setItem(
          key,
          JSON.stringify({
            ...parsed,
            state: { ...parsed.state, overrides },
          })
        )
      } catch (error) {
        console.error(`Failed to persist scope ${scopeId} overrides:`, error)
      }
    },
    persistDarkMode: (isDarkMode: boolean | undefined) => {
      try {
        const key = getScopeStorageKey(scopeId)
        const current = storage.getItem(key)
        if (current instanceof Promise) return
        const parsed = current ? JSON.parse(current) : {}
        void storage.setItem(
          key,
          JSON.stringify({
            ...parsed,
            state: {
              ...parsed.state,
              isDarkModeEnabled: isDarkMode,
            },
          })
        )
      } catch (error) {
        console.error(`Failed to persist scope ${scopeId} dark mode:`, error)
      }
    },
  }
}
