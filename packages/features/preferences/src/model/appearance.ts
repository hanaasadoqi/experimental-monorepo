import { z } from "zod"

export const appearancePreferenceSchema = z.enum(["light", "dark", "system"])

export type AppearancePreference = z.infer<typeof appearancePreferenceSchema>

export const DEFAULT_APPEARANCE_PREFERENCE: AppearancePreference = "system"
