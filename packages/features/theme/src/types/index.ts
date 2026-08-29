export type Theme = "light" | "dark" | "system"

export interface ThemeConfig {
  mode: Theme
  systemPreference: MediaQueryList | null
}

export interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}
