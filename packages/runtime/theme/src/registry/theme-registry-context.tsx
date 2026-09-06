/**
 * Theme Registry Context & Hook
 *
 * Provides app-wide access to the theme registry and selection state.
 * Wrap your app with <ThemeRegistryProvider> to enable theme queries and selection.
 */

"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useStore } from "zustand"
import {
  createThemeRegistryStore,
  type ThemeRegistryStoreState,
} from "./create-theme-registry-store"
import type { ThemeDefinition } from "@repo/domain-theme"

type ThemeRegistryStore = ReturnType<typeof createThemeRegistryStore>

const ThemeRegistryContext = createContext<ThemeRegistryStore | null>(null)

export interface ThemeRegistryProviderProps {
  initialThemes: Record<string, ThemeDefinition>
  initialSelectedId?: string
  children: ReactNode
}

/**
 * Provider for theme registry and selection.
 *
 * Initializes a Zustand store with available themes and exposes it to child components.
 *
 * Usage:
 * ```tsx
 * <ThemeRegistryProvider
 *   initialThemes={{
 *     light: { ... },
 *     dark: { ... },
 *   }}
 *   initialSelectedId="light"
 * >
 *   <App />
 * </ThemeRegistryProvider>
 * ```
 */
export function ThemeRegistryProvider({
  initialThemes,
  initialSelectedId,
  children,
}: ThemeRegistryProviderProps) {
  const store = createThemeRegistryStore(initialThemes, initialSelectedId)

  return (
    <ThemeRegistryContext.Provider value={store}>
      {children}
    </ThemeRegistryContext.Provider>
  )
}

/**
 * Hook to access the theme registry.
 *
 * Returns the registry store state and methods.
 *
 * Usage:
 * ```tsx
 * function ThemeSwitcher() {
 *   const { selectedThemeId, listThemes, selectTheme } = useThemeRegistry()
 *   return (
 *     <select value={selectedThemeId} onChange={(e) => selectTheme(e.target.value)}>
 *       {listThemes().map(t => <option key={t.metadata.name}>{t.metadata.name}</option>)}
 *     </select>
 *   )
 * }
 * ```
 */
export function useThemeRegistry(): ThemeRegistryStoreState {
  const store = useContext(ThemeRegistryContext)

  if (!store) {
    throw new Error(
      "useThemeRegistry must be used within <ThemeRegistryProvider>. " +
        "Wrap your app with <ThemeRegistryProvider> first."
    )
  }

  return useStore(store)
}
