import { z } from "zod"
import { APPEARANCE_OPTIONS, RESOLVED_APPEARANCE_OPTIONS } from "./defaults"

export const appearancePreferenceSchema = z
  .enum(APPEARANCE_OPTIONS)
  .default("system")

export type AppearancePreference = z.infer<typeof appearancePreferenceSchema>

export const resolvedPreferenceSchema = z
  .enum(RESOLVED_APPEARANCE_OPTIONS)
  .default("light")

export type ResolvedAppearancePreference = z.infer<
  typeof resolvedPreferenceSchema
>
