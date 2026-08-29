import { themeStore } from "../store/theme-store"
import type { Theme, ThemeContextValue } from "../types"

export const useTheme = (): ThemeContextValue => {
  return themeStore((state) => ({
    theme: state.theme,
    isDark: state.isDark,
    setTheme: state.setTheme,
  }))
}

export const useSetTheme = (): ((theme: Theme) => void) => {
  return themeStore((state) => state.setTheme)
}

export const useCurrentTheme = (): Theme => {
  return themeStore((state) => state.theme)
}

export const useIsDark = (): boolean => {
  return themeStore((state) => state.isDark)
}
