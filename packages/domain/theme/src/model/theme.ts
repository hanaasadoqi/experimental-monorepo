import { z } from "zod"
import { oklchColorSchema, semanticColorOverridesSchema } from "./color"

export const themeColorSchema = z.object({
  base: oklchColorSchema,
})

export type ThemeColor = z.infer<typeof themeColorSchema>

export const themeColorsSchema = z.object({
  primary: oklchColorSchema,
  accent: oklchColorSchema,
  neutral: oklchColorSchema.optional(),
  semantic: semanticColorOverridesSchema,
})

export type ThemeColors = z.infer<typeof themeColorsSchema>

export const themeInputSchema = z.object({
  primary: oklchColorSchema,
  accent: oklchColorSchema.optional(),
  neutral: oklchColorSchema.optional(),
  semantic: semanticColorOverridesSchema,
})

export type ThemeInput = z.infer<typeof themeInputSchema>
