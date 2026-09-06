import { z } from "zod"
import { themeColorSchema } from "../colors"
import { darkModeSchema } from "../dark-mode"

export const ThemeOverridesSchema = z
  .object({ ...themeColorSchema.shape, ...darkModeSchema.shape })
  .partial()

export type ThemeOverrides = z.infer<typeof ThemeOverridesSchema>
