import { z } from "zod"
import { OKLCH_REGEX } from "../defaults/theme"
import {
  appearancePreferenceSchema,
  type AppearancePreference,
} from "./preferences"

/** @deprecated Use `appearancePreferenceSchema`. */
export const themeAppearanceSchema = appearancePreferenceSchema

export const themeOklchColorSchema = z.string().regex(OKLCH_REGEX)

/**
 * Schema for theme form inputs
 */
export const themeFormSchema = z.object({
  appearance: themeAppearanceSchema,
  accentColor: themeOklchColorSchema,
})

/** @deprecated Use `AppearancePreference`. */
export type ThemeAppearance = AppearancePreference
export type ThemeOklchColor = z.infer<typeof themeOklchColorSchema>
export type ThemeForm = z.infer<typeof themeFormSchema>
export type Theme = z.infer<typeof themeFormSchema>
