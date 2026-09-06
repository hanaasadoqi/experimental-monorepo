import { z } from "zod"
import { darkModeSchema } from "../dark-mode"
import { themeColorSchema } from "../colors"

export const themeFormSchema = z.object({
  ...darkModeSchema.shape,
  ...themeColorSchema.shape,
})

export type ThemeForm = z.infer<typeof themeFormSchema>
