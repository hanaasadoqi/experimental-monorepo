import { z } from "zod"
export const OKLCH_REGEX = /^oklch\(([\d.]+)(%?)?\s+([\d.]+)\s+([\d.]+)\)$/
/**
 * WCAG compliance level contrast ratio thresholds
 */
export const CONTRAST_THRESHOLDS = {
  AA_NORMAL: 4.5, // Normal text, AA level
  AA_LARGE: 3, // Large text (18pt+), AA level
  AAA_NORMAL: 7, // Normal text, AAA level
  AAA_LARGE: 4.5, // Large text AAA level
} as const

export const MIN_LIGHTNESS = 0
export const MAX_LIGHTNESS = 100
export const MIN_CHROMA = 0
export const MAX_CHROMA = 0.4
export const MIN_HUE = 0
export const MAX_HUE = 360

/* -------------------------------------------------------------------------- */
/* OKLCH                                                                      */
/* -------------------------------------------------------------------------- */

export const oklchColorSchema = z.object({
  l: z.number().min(MIN_LIGHTNESS).max(MAX_LIGHTNESS),
  c: z.number().min(MIN_CHROMA).max(MAX_CHROMA).nonnegative(),
  h: z.number().min(MIN_HUE).max(MAX_HUE),
  alpha: z.number().min(0).max(1).optional(),
})

export type OklchColor = z.infer<typeof oklchColorSchema>

/**
 * Convenience compile-time string shape.
 *
 * This does NOT prove that the contents are valid OKLCH.
 * Runtime strings must still be parsed/validated.
 */
// export type OklchString = `oklch(${string})`
export type HexColor = `#${string}`

export const oklchStrSchema = z.string().regex(OKLCH_REGEX)

export type oklchColor = z.infer<typeof oklchColorSchema>

export type OklchString = z.infer<typeof oklchStrSchema>
export type OklchStr = OklchString

export const DEFAULT_PRIMARY_BASE: OklchStr = "oklch(65% 0.15 250)"

/* -------------------------------------------------------------------------- */
/* L,MS scale                                                                */
/* -------------------------------------------------------------------------- */

export const lmsColorSchema = z.object({
  l: z.number(),
  m: z.number(),
  s: z.number(),
})

export type lmsColor = z.infer<typeof lmsColorSchema>
/* -------------------------------------------------------------------------- */
/* Color scale                                                                */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Harmony                                                                    */
/* -------------------------------------------------------------------------- */

export const colorHarmonySchema = z.enum([
  "analogous",
  "complementary",
  "split-complementary",
  "triadic",
  "tetradic",
  "rectangle",
])

export type ColorHarmony = z.infer<typeof colorHarmonySchema>

/* -------------------------------------------------------------------------- */
/* Semantic colors                                                            */
/* -------------------------------------------------------------------------- */

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
