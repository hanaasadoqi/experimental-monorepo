import type { AppearancePreference } from "../schemas/preferences.js"
import { Theme } from "./theme.js";

export type ResolvedAppearance = Omit<AppearancePreference, "system">;

export type AppearanceSource = 'user' | 'system'

export interface SavedAppearancePreference {
  appearance: ResolvedAppearance;
  timestamp: number;
  source: AppearanceSource;
}

export interface UserPreferences {
  appearance: AppearancePreference
  theme?: Theme;
  reducedMotion?: boolean
  highContrast?: boolean
}
