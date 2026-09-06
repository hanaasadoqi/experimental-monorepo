import { z } from "zod"

import { appearancePreferenceSchema } from "@repo/domain-preferences"

export const preferencesCookieSchema = z.object({
  appearance: appearancePreferenceSchema,
})

export type PreferencesCookie = z.infer<typeof preferencesCookieSchema>
