import { z } from "zod"

import { appearancePreferenceSchema } from "@repo/feature-preferences"

export const preferencesCookieSchema = z.object({
  appearance: appearancePreferenceSchema,
})

export type PreferencesCookie = z.infer<typeof preferencesCookieSchema>
