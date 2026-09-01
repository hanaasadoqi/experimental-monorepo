import { z } from "zod"

export const OKLCH_REGEX = /^oklch\(([\d.]+)(%?)?\s+([\d.]+)\s+([\d.]+)\)$/

export const CONTRAST_THRESHOLDS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
} as const

export const oklchColorSchema = z.object({
  l: z.number().min(0).max(1).describe("Lightness 0..1"),
  c: z.number().nonnegative().describe("Chroma >= 0"),
  h: z.number().min(0).max(360).describe("Hue 0..<360"),
  alpha: z.number().min(0).max(1).optional().describe("Alpha 0..1"),
})

export type OklchColor = z.infer<typeof oklchColorSchema>
export type oklchColor = OklchColor

export interface lmsColor {
  l: number
  m: number
  s: number
}

export type OklchStr = `oklch(${string})`

export const oklchStrSchema = z
  .string()
  .regex(OKLCH_REGEX)
  .transform((value) => value as OklchStr)

export type OklchString = z.infer<typeof oklchStrSchema>

export const DEFAULT_PRIMARY_BASE: OklchStr = "oklch(65% 0.15 250)"

export const colorScaleStepSchema = z.enum([
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
])

export type ColorScaleStep = z.infer<typeof colorScaleStepSchema>

export const colorScaleSchema = z.object({
  50: oklchColorSchema,
  100: oklchColorSchema,
  200: oklchColorSchema,
  300: oklchColorSchema,
  400: oklchColorSchema,
  500: oklchColorSchema,
  600: oklchColorSchema,
  700: oklchColorSchema,
  800: oklchColorSchema,
  900: oklchColorSchema,
  950: oklchColorSchema,
})

export type ColorScale = z.infer<typeof colorScaleSchema>

export const colorHarmonySchema = z.enum([
  "analogous",
  "complementary",
  "split-complementary",
  "triadic",
  "tetradic",
  "rectangle",
])

export type ColorHarmony = z.infer<typeof colorHarmonySchema>

export const semanticColorNameSchema = z.enum([
  "success",
  "warning",
  "destructive",
  "info",
])

export type SemanticColorName = z.infer<typeof semanticColorNameSchema>

export const semanticColorOverridesSchema = z
  .object({
    success: oklchColorSchema.optional(),
    warning: oklchColorSchema.optional(),
    destructive: oklchColorSchema.optional(),
    info: oklchColorSchema.optional(),
  })
  .optional()

export type SemanticColorOverrides = z.infer<
  typeof semanticColorOverridesSchema
>
