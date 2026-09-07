import { create } from "zustand"
import { ThemeOverrides } from "@repo/domain-theme"

// Internal alias for clarity within this module
type ThemeScopeRuntimeState = {
  id: string
  isDarkMode: boolean
  scopeIds: string[]
  overrides?: ThemeOverrides
}

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
}

type InternalThemeStore = InternalThemeState & InternalThemeActions

/**
 * Create a global theme scope instance with given darkMode state.
 */
function createGlobalTheme(
  isDarkMode: boolean,
  scopeIds: string[] = ["root"],
  overrides: ThemeOverrides
): ThemeScopeRuntimeState {
  return {
    id: "root",
    isDarkMode,
    scopeIds,
    overrides,
  }
}

export const useThemeStore = create<InternalThemeStore>((set, get) => ({
  themes: {
    root: createGlobalTheme(false, ["root"], {}),
  },

  getTheme: (id: string) => {
    return get().themes[id]
  },

  getGlobalTheme: () => {
    return get().themes["root"] ?? createGlobalTheme(false, ["root"], {})
  },

  setGlobalDarkMode: (darkMode: boolean | undefined) => {
    set((state) => ({
      themes: {
        ...state.themes,
        root: {
          ...state.themes["root"]!,
          isDarkMode: darkMode ?? state.themes["root"]!.isDarkMode,
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
}))
