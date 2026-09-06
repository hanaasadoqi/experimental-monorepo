import { z } from "zod"
import {
  dateFormatPreferenceSchema,
  timeFormatPreferenceSchema,
} from "../date-time"

import { appearancePreferenceSchema } from "../appearance"
import { languagePreferenceSchema } from "../language"

export const preferencesSchema = z.object({
  appearance: appearancePreferenceSchema,
  language: languagePreferenceSchema,
  dateFormat: dateFormatPreferenceSchema,
  timeFormat: timeFormatPreferenceSchema,
})

export type Preferences = z.infer<typeof preferencesSchema>
