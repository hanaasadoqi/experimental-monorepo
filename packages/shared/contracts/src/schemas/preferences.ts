import { z } from "zod"

export const appearancePreferenceSchema = z.enum(["light", "dark", "system"])

export type AppearancePreference = z.infer<typeof appearancePreferenceSchema>

export const preferencesStateSchema = z.object({
  appearance: appearancePreferenceSchema,
  setAppearance: z
    .function()
    .args(appearancePreferenceSchema)
    .returns(z.void()),
})

export type PreferencesState = z.infer<typeof preferencesStateSchema>
