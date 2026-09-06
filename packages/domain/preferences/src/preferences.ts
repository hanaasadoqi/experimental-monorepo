import { z } from "zod"

import {
  appearancePreferenceSchema,
  DEFAULT_APPEARANCE_PREFERENCE,
} from "./appearance"

export const preferencesSchema = z.object({
  appearance: appearancePreferenceSchema,
})

export type Preferences = z.infer<typeof preferencesSchema>

export const DEFAULT_PREFERENCES: Preferences = {
  appearance: DEFAULT_APPEARANCE_PREFERENCE,
}
