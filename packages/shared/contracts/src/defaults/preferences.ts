import type { AppearancePreference, PreferencesState } from "../schemas";

export const DEFAULT_APPEARANCE_PREFERENCE: AppearancePreference = "system";

export const DEFAULT_PREFS_STATE: PreferencesState = {
  appearancePreference: DEFAULT_APPEARANCE_PREFERENCE,
  setAppearancePreference: (appearance: AppearancePreference) => appearance
}
