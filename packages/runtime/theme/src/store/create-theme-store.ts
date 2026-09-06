import { create } from "zustand"

export type ThemeState = {
  theme: "light" | "dark"
  isDarkModeEnabled: boolean | undefined
}

export type ThemeActions = {
  toggleTheme: () => void
  setDarkMode: (isDarkMode: boolean | undefined) => void
  toggleEnableMode: () => void
}

export type ThemeStore = ThemeState & ThemeActions

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "light",
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),
  isDarkModeEnabled: undefined,
  toggleEnableMode: () =>
    set((state) => ({
      isDarkModeEnabled: !state.isDarkModeEnabled,
    })),
  setDarkMode: (isDarkMode) => set({ isDarkModeEnabled: isDarkMode }),
}))
