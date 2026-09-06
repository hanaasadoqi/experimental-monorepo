import { z } from "zod"
import { themeColorSchema } from "../colors"
import { darkModeSchema } from "../dark-mode"

export const ThemeOverridesSchema = z.object({
  ...themeColorSchema.optional(),
  ...darkModeSchema.optional(),
})

export type ThemeOverrides = z.infer<typeof ThemeOverridesSchema>
