import { create } from "zustand"
import type { Theme } from "@repo/shared-contracts"

// Internal alias for clarity within this module
type ThemeScopeRuntimeState = Theme

/**
 * Internal types for implementation.
 * Public ThemeStore interface is defined in @repo/shared-contracts.
 */
type InternalThemeState = {
  themes: Record<string, ThemeScopeRuntimeState>
}

type InternalThemeActions = {
  getTheme: (id: string) => ThemeScopeRuntimeState | undefined
  getGlobalTheme: () => ThemeScopeRuntimeState
  setGlobalDarkMode: (darkMode: boolean | undefined) => void
  toggleDarkMode: () => void
  setEnableDarkMode: (enableDarkMode: boolean) => void
  toggleEnableDarkMode: () => void
}

type InternalThemeStore = InternalThemeState & InternalThemeActions

/**
 * Create a global theme scope instance with given darkMode state.
 */
function createGlobalTheme(
  isDarkMode: boolean | undefined,
  enableDarkMode: boolean
): ThemeScopeRuntimeState {
  return {
    id: "root",
    enableDarkMode,
    isDarkMode,
    scopeIds: ["root"],
  }
}

export const useThemeStore = create<InternalThemeStore>((set, get) => ({
  themes: {
    root: createGlobalTheme(undefined, true),
  },

  getTheme: (id: string) => {
    return get().themes[id]
  },

  getGlobalTheme: () => {
    return get().themes["root"] ?? createGlobalTheme(undefined, false)
  },

  setGlobalDarkMode: (darkMode: boolean | undefined) => {
    set((state) => ({
      themes: {
        ...state.themes,
        root: {
          ...state.themes["root"]!,
          isDarkMode: (state.themes["root"]!.enableDarkMode ? darkMode : undefined)
        },
      },
    }))
  },

  toggleDarkMode: () => {
    set((state) => {
      const globalTheme = state.themes["root"]!
      return {
        themes: {
          ...state.themes,
          root: {
            ...globalTheme,
            isDarkMode: !globalTheme.isDarkMode,
          },
        },
      }
    })
  },
  setEnableDarkMode: (enableDarkMode: boolean) => {
    set((state) => {
      const globalTheme = state.themes["root"]!
      const globalEnableDarkMode = globalTheme.enableDarkMode
      const isEqual = globalEnableDarkMode === enableDarkMode
      if (isEqual) {
        return state
      }
      return {
        themes: {
          ...state.themes,
          root: {
            ...globalTheme,
            enableDarkMode,
            // When disabling dark mode, clear isDarkMode
            // When enabling dark mode, let ThemeScopeProvider set it via resolvedAppearance
            isDarkMode: enableDarkMode ? globalTheme.isDarkMode : undefined,
          },
        },
      }
    })
  },
  toggleEnableDarkMode: () => {
    set((state) => {
      const globalTheme = state.themes["root"]!
      const newEnableDarkMode = !globalTheme.enableDarkMode
      state.setEnableDarkMode(newEnableDarkMode)
      return state
    })
  }
}))
