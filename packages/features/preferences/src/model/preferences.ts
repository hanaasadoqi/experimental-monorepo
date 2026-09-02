import { z } from "zod"
import {
  appearancePreferenceSchema,
  DEFAULT_APPEARANCE_PREFERENCE,
  type AppearancePreference,
} from "./appearance"

export const preferencesSchema = z.object({
  appearance: appearancePreferenceSchema,
})

export type Preferences = z.infer<typeof preferencesSchema>

export const DEFAULT_PREFERENCES: Preferences = {
  appearance: DEFAULT_APPEARANCE_PREFERENCE,
}

export interface PreferencesActions {
  setAppearance: (appearance: AppearancePreference) => void
}

export const DEFAULT_PREFERENCES_ACTIONS: PreferencesActions = {
  setAppearance: (appearance: AppearancePreference) => appearance,
}

export type PreferencesState = Preferences & PreferencesActions
