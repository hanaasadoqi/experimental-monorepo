import { z } from "zod"

export const appearancePreferenceSchema = z.enum(["light", "dark", "system"])

export type AppearancePreference =
  z.infer<typeof appearancePreferenceSchema>

export type ResolvedAppearance = Omit<AppearancePreference, "system">

export type AppearanceSource = "user" | "system"

export interface SavedAppearancePreference {
  appearance: ResolvedAppearance
  timestamp: number
  source: AppearanceSource
}

export const DEFAULT_APPEARANCE_PREFERENCE: AppearancePreference = "system"
