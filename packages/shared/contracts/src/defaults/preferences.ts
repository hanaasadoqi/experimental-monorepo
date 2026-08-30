import type {
  AppearancePreference,
  PreferencesState,
} from "../schemas/index.js"

export const DEFAULT_APPEARANCE_PREFERENCE: AppearancePreference = "system"

export const DEFAULT_PREFERENCES_STATE: PreferencesState = {
  appearance: DEFAULT_APPEARANCE_PREFERENCE,
  setAppearance: (appearance: AppearancePreference) => appearance,
}
