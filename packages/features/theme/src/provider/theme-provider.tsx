import { ReactNode, useEffect } from "react"

import { themeStore } from "../store/theme-store"
import type { ThemeStoreState } from "../store/theme-store"

/**
 * The narrow slice of a theme store this provider actually uses. Declaring
 * it structurally keeps the prop compatible with any Zustand store shape
 * (bound hook or plain store API) and with hand-rolled test doubles.
 */
export interface ThemeStoreLike {
  getState: () => ThemeStoreState
  subscribe: (listener: (state: ThemeStoreState) => void) => () => void
}

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
  store?: ThemeStoreLike
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
