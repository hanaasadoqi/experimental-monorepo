import { createStore } from "@repo/services-zustand/store"

import type { Theme, ThemeContextValue } from "../types"

interface ThemeStoreState extends ThemeContextValue {
  setTheme: (theme: Theme) => void
}

export const createThemeStore = () => {
  return createStore<ThemeStoreState>(
    (set: (fn: (state: ThemeStoreState) => Partial<ThemeStoreState>) => void) => ({
      theme: "system" as Theme,
      isDark: false,
      setTheme: (theme: Theme) =>
        set(() => ({
          theme,
          isDark: theme === "dark" || (theme === "system" && isSystemDark()),
        })),
    })
  )
}

const isSystemDark = (): boolean => {
  if (typeof window === "undefined") return false
  if (!window.matchMedia) return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export const themeStore = createThemeStore()
