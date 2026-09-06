import { create } from "zustand"
import type { Theme } from "@repo/domain-theme"

/**
 * Internal types for implementation.
 * Public ThemeStore interface is defined in @repo/shared-contracts.
 */
type InternalThemeState = {
  themes: Record<string, Theme>
}

type InternalThemeActions = {
  getTheme: (id: string) => Theme | undefined
  getGlobalTheme: () => Theme
  setGlobalThemeDarkMode: (darkMode: boolean | undefined) => void
  toggleTheme: () => void
}

type InternalThemeStore = InternalThemeState & InternalThemeActions

/**
 * Create a global theme instance with given darkMode state.
 */
function createGlobalTheme(darkMode: boolean | undefined): Theme {
  return {
    id: "root",
    enableDarkMode: true,
    darkMode,
    scopeIds: ["root"],
  }
}

export const useThemeStore = create<InternalThemeStore>((set, get) => ({
  themes: {
    root: createGlobalTheme(false),
  },

  getTheme: (id: string) => {
    return get().themes[id]
  },

  getGlobalTheme: () => {
    return get().themes["root"] ?? createGlobalTheme(false)
  },

  setGlobalThemeDarkMode: (darkMode: boolean | undefined) => {
    set((state) => ({
      themes: {
        ...state.themes,
        root: {
          ...state.themes["root"]!,
          darkMode,
        },
      },
    }))
  },

  toggleTheme: () => {
    set((state) => {
      const globalTheme = state.themes["root"]!
      return {
        themes: {
          ...state.themes,
          root: {
            ...globalTheme,
            darkMode: !globalTheme.darkMode,
          },
        },
      }
    })
  },
}))
