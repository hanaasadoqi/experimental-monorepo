import { z } from "zod"
import { LANGUAGE_PREFERENCE_OPTIONS } from "./defaults"

export const languagePreferenceSchema = z
  .enum(LANGUAGE_PREFERENCE_OPTIONS)
  .default("en")

export type LanguagePreference = z.infer<typeof languagePreferenceSchema>
