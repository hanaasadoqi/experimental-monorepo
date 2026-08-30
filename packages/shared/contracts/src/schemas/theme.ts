import { z } from "zod"

import {
  appearancePreferenceSchema,
} from "./preferences.js"
import { oklchStrSchema } from "./colors.js";

/**
 * Schema for theme form inputs
 */
export const themeFormSchema = z.object({
  appearance: appearancePreferenceSchema,
  primaryColor: oklchStrSchema,
})

export type ThemeForm = z.infer<typeof themeFormSchema>;
