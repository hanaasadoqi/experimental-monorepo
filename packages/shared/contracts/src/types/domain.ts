/**
 * Core domain types for appearance, theme, and preferences
 */

// Appearance types
export type AppearanceMode = 'light' | 'dark' | 'system'

export interface AppearancePreference {
  mode: AppearanceMode
  timestamp: number
  source: 'user' | 'system'
}

// Theme types
export interface ThemeColor {
  oklch: string  // oklch(L% C H) format
  wcagContrast?: number
}

export interface Theme {
  appearance: AppearanceMode
  accentColor: ThemeColor | string  // string for oklch format
  timestamp?: number
}

// Preferences types
export interface UserPreferences {
  appearance: AppearanceMode
  theme?: Theme
  reducedMotion?: boolean
  highContrast?: boolean
}

// Deprecated (backwards compatibility)
/** @deprecated Use AppearancePreference instead */
export type ThemeAppearance = AppearanceMode

/** @deprecated Use Theme instead */
export type ThemeForm = Theme

// Storage/Persistence types
export interface PersistenceAdapter<T = unknown> {
  read(key: string): Promise<T | null>
  write(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
  clear?(): Promise<void>
}

export interface PersistenceConfig {
  key: string
  adapter: PersistenceAdapter
  version?: number
  migrate?: (state: unknown, version: number) => unknown
  partialPersist?: (state: unknown) => Partial<unknown>
}
