import { z } from "zod"

export const appearancePreferenceSchema = z.enum(["light", "dark", "system"])

export type AppearancePreference = z.infer<typeof appearancePreferenceSchema>

export const DEFAULT_APPEARANCE_PREFERENCE: AppearancePreference = "system"


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

export type ResolvedAppearance = "light" | "dark";
