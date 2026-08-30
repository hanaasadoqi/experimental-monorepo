import type { AppearancePreference, PreferencesState } from "../schemas/index.js"

export const DEFAULT_APPEARANCE_PREFERENCE: AppearancePreference = "system"

export const DEFAULT_PREFERENCES_STATE: PreferencesState = {
  appearancePreference: DEFAULT_APPEARANCE_PREFERENCE,
  setAppearancePreference: (appearance: AppearancePreference) => appearance,
}
