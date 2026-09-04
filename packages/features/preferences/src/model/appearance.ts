import { z } from "zod"

export const appearancePreferenceSchema = z.enum(["light", "dark", "system"])

export type AppearancePreference = z.infer<typeof appearancePreferenceSchema>

export const DEFAULT_APPEARANCE_PREFERENCE: AppearancePreference = "system"

export const resolvedPreferenceSchema = z.enum(["light", "dark"])

export type ResolvedPreference = z.infer<typeof resolvedPreferenceSchema>

export const DEFAULT_RESOLVED_PREFERENCE: ResolvedPreference = "light"
