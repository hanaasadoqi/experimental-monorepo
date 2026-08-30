import { z } from "zod"
import {
  MAX_CHROMA,
  MAX_HUE,
  MAX_LIGHTNESS,
  MIN_CHROMA,
  MIN_HUE,
  MIN_LIGHTNESS,
  OKLCH_REGEX,
} from "../defaults/colors.js"

export { OKLCH_REGEX } from "../defaults/colors.js"

export const oklchStrSchema = z.string().regex(OKLCH_REGEX)

export type OklchStr = z.infer<typeof oklchStrSchema>

export const oklchColorSchema = z.object({
  lightness: z.number().min(MIN_LIGHTNESS).max(MAX_LIGHTNESS),
  chroma: z.number().min(MIN_CHROMA).max(MAX_CHROMA),
  hue: z.number().min(MIN_HUE).max(MAX_HUE),
})

export type oklchColor = z.infer<typeof oklchColorSchema>

export const lmsColorSchema = z.object({
  l: z.number(),
  m: z.number(),
  s: z.number(),
})

export type lmsColor = z.infer<typeof lmsColorSchema>
