import { ReactNode, useEffect } from "react"
import type { StoreApi } from "zustand"

import { themeStore } from "../store/theme-store"
import type { ThemeStoreState } from "../store/theme-store"

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: "light" | "dark" | "system"
  /**
   * Store driving this provider. Defaults to the module-level `themeStore`
   * so existing call sites keep working unchanged.
   *
   * Passing a store makes the dependency explicit rather than global: tests
   * inject a fresh `createThemeStore()` instead of mocking the module, and
   * several providers can run side by side without sharing state.
   */
  store?: StoreApi<ThemeStoreState>
}

/**
 * Legacy provider that applies the `dark` class from a theme store.
 *
 * Prefer `AppearanceProvider`, which owns the full appearance lifecycle
 * (store, persistence, system media query, DOM). This provider is retained
 * for backward compatibility.
 */
export const ThemeProvider = ({
  children,
  defaultTheme = "system",
  store = themeStore,
}: ThemeProviderProps): ReactNode => {
  useEffect(() => {
    const state = store.getState()

    if (state.theme === "system") {
      state.setTheme(defaultTheme)
    }

    const applyTheme = (theme: string) => {
      const isDark =
        theme === "dark" ||
        (theme === "system" &&
          window.matchMedia?.("(prefers-color-scheme: dark)").matches)

      const html = document.documentElement
      if (isDark) {
        html.classList.add("dark")
      } else {
        html.classList.remove("dark")
      }
    }

    applyTheme(store.getState().theme)

    const unsubscribe = store.subscribe((newState) => {
      applyTheme(newState.theme)
    })

    return () => unsubscribe()
  }, [defaultTheme, store])

  return <>{children}</>
}

export type { ThemeProviderProps }
