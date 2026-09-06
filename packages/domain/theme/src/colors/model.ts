import { z } from "zod"
import { COLOR_HARMONY_OPTIONS, oklchStrSchema } from "./utils"

export const DEFAULT_THEME_COLOR = "oklch(55.1% 0.027 264.364)"

export const DEFAULT_PRIMARY_COLOR = "oklch(70.4% 0.14 182.503)"

export const themeColorSchema = z.object({
  primary: oklchStrSchema
    .describe("Primary color of theme")
    .default(DEFAULT_PRIMARY_COLOR),
  accent: oklchStrSchema.describe("Accent color of theme").optional(),
  customAccent: z.boolean().default(false).describe("Customize accent color"),
  harmony: z
    .enum(COLOR_HARMONY_OPTIONS)
    .optional()
    .describe("Color harmony type for generating accent options"),
})

export type ThemeColors = z.infer<typeof themeColorSchema>
