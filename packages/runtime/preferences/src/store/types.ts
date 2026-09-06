import type { Preferences } from "@repo/domain-preferences"

export interface PreferencesActions {
  setAppearance: (appearance: Preferences["appearance"]) => void
  setLanguage: (language: Preferences["language"]) => void
  setDateFormat: (dateFormat: Preferences["dateFormat"]) => void
  setTimeFormat: (timeFormat: Preferences["timeFormat"]) => void
}

export type PreferencesStore = Preferences & PreferencesActions
