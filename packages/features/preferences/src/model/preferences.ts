import {
  DEFAULT_PREFERENCES,
  preferencesSchema,
  type AppearancePreference,
  type Preferences,
} from "@repo/domain-preferences"

export {
  DEFAULT_PREFERENCES,
  preferencesSchema,
  type AppearancePreference,
  type Preferences,
}

export interface PreferencesActions {
  setAppearance: (appearance: AppearancePreference) => void
}

export const DEFAULT_PREFERENCES_ACTIONS: PreferencesActions = {
  setAppearance: (appearance: AppearancePreference) => appearance,
}

export type PreferencesState = Preferences & PreferencesActions
