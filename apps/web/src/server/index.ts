import { z } from "zod"

import { appearancePreferenceSchema } from "@repo/features-preferences"

export const preferencesCookieSchema = z.object({
  appearance: appearancePreferenceSchema,
})

export type PreferencesCookie = z.infer<typeof preferencesCookieSchema>
