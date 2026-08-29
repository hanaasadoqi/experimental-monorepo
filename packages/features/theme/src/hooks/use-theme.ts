import { themeStore } from "../store/theme-store";
import type { Theme, ThemeContextValue } from "../types";

export const useTheme = (): ThemeContextValue => {
  const state = themeStore.getState()
  return {
    theme: state.theme,
    isDark: state.isDark,
    setTheme: state.setTheme,
  }
}

export const useSetTheme = (): ((theme: Theme) => void) => {
  return themeStore.getState().setTheme
}

export const useCurrentTheme = (): Theme => {
  return themeStore.getState().theme
}

export const useIsDark = (): boolean => {
  return themeStore.getState().isDark
}
