import { z } from "zod"
import { OKLCH_REGEX } from "../defaults"

export const themeAppearanceSchema = z.enum(["light", "dark", "system"])

export const themeOklchColorSchema = z.string().regex(OKLCH_REGEX)

/**
 * Schema for theme form inputs
 */
export const themeFormSchema = z.object({
  appearance: themeAppearanceSchema,
  accentColor: themeOklchColorSchema,
})

export type ThemeAppearance = z.infer<typeof themeAppearanceSchema>
export type ThemeOklchColor = z.infer<typeof themeOklchColorSchema>
export type ThemeForm = z.infer<typeof themeFormSchema>
export type Theme = z.infer<typeof themeFormSchema>
