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

// ---------------------------------------------------------------------------
// Appearance types
//
// These model the same "light | dark | system" preference as `Theme` above,
// but separate the user's stated preference from the resolved color scheme
// that preference produces once a concrete system value is known. Existing
// `Theme`-prefixed exports are preserved above; the aliases below let
// consumers migrate to the `Appearance`-prefixed names incrementally.
// ---------------------------------------------------------------------------

export type AppearancePreference = "light" | "dark" | "system"

export type ResolvedColorScheme = "light" | "dark"

export interface AppearanceState {
  preference: AppearancePreference
  resolvedColorScheme: ResolvedColorScheme
  setPreference: (preference: AppearancePreference) => void
}

export type CreateAppearanceStore = (
  defaultPreference?: AppearancePreference,
  systemScheme?: ResolvedColorScheme
) => import("zustand").StoreApi<AppearanceState>

/** @deprecated Use {@link AppearancePreference} instead. */
export type ThemePreference = AppearancePreference

/** @deprecated Use {@link AppearanceState} instead. */
export type ThemeState = AppearanceState
