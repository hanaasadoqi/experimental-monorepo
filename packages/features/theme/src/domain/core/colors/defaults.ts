import { z } from "zod"

/**
 * OKLch Color Space Representation
 *
 * Represents a color in cylindrical OKLch (lightness, chroma, hue) format.
 * Perceptually uniform for both lightness and colorfulness.
 *
 * @see {@link https://oklab.github.io|OKLab specification}
 */

export type OklchStr = `oklch(${string})`

export type lmsColor = {
  l: number
  m: number
  s: number
}

export const OKLCH_REGEX = /^oklch\(([\d.]+)(%?)?\s+([\d.]+)\s+([\d.]+)\)$/

export const oklchColorSchema = z.object({
  lightness: z.number(),
  chroma: z.number(),
  hue: z.number(),
  alpha: z.number().min(0).max(1).optional(),
})

export type oklchColor = z.infer<typeof oklchColorSchema>

export const oklchStrSchema = z
  .string()
  .regex(OKLCH_REGEX)
  .transform((value) => value as OklchStr)

// WCAG compliance level contrast ratio thresholds
export const CONTRAST_THRESHOLDS = {
  AA_NORMAL: 4.5, // Normal text, AA level
  AA_LARGE: 3, // Large text (18pt+), AA level
  AAA_NORMAL: 7, // Normal text, AAA level
  AAA_LARGE: 4.5, // Large text AAA level
} as const
