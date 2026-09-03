import { z } from "zod"

import {
  MAX_CHROMA,
  MAX_HUE,
  MAX_LIGHTNESS,
  MIN_CHROMA,
  MIN_HUE,
  MIN_LIGHTNESS,
  OKLCH_REGEX,
} from "./constants"

/**
 * Color types and schemas.
 *
 * TWO OKLCH REPRESENTATIONS LIVE HERE, DELIBERATELY. They are kept in one file
 * so the difference is impossible to miss and nobody adds a third:
 *
 * |          | `OklchColor`        | `OklchComponents`            |
 * |----------|---------------------|------------------------------|
 * | fields   | `l`, `c`, `h`       | `lightness`, `chroma`, `hue` |
 * | hue unit | degrees (0..360)    | **radians**                  |
 * | role     | persisted / CSS     | computation                  |
 *
 * `OklchComponents` needs radians because `transformOklchToLMS` feeds the hue
 * straight into `Math.cos` / `Math.sin`. `parseOklch` is the boundary that
 * converts a CSS string into that form, degrees -> radians.
 *
 * Use `OklchColor` for anything stored, serialized, or rendered.
 */

/* -------------------------------------------------------------------------- */
/* OKLCH — persisted / CSS-facing                                             */
/* -------------------------------------------------------------------------- */

export const oklchColorSchema = z.object({
  l: z
    .number()
    .min(MIN_LIGHTNESS)
    .max(MAX_LIGHTNESS)
    .describe("Lightness 0..1"),
  c: z.number().min(MIN_CHROMA).max(MAX_CHROMA).describe("Chroma 0..0.4"),
  h: z.number().min(MIN_HUE).max(MAX_HUE).describe("Hue in degrees, 0..360"),
  alpha: z.number().min(0).max(1).optional().describe("Alpha 0..1"),
})

export type OklchColor = z.infer<typeof oklchColorSchema>

/** `OklchColor` without alpha — the triple the geometry helpers operate on. */
export type Oklch = Pick<OklchColor, "l" | "c" | "h">

/**
 * Compile-time shape for a CSS `oklch()` string.
 * Does NOT prove the contents are valid — parse at runtime before trusting it.
 */
export const oklchStrSchema = z
  .string()
  .regex(OKLCH_REGEX)
  .transform((value) => value as OklchString)

export type OklchString = `oklch(${string})`

export type HexColor = `#${string}`

/* -------------------------------------------------------------------------- */
/* OKLCH — computation form                                                   */
/* -------------------------------------------------------------------------- */

export const oklchComponentsSchema = z.object({
  lightness: z.number().describe("Lightness 0..1"),
  chroma: z.number().describe("Chroma >= 0"),
  hue: z.number().describe("Hue in RADIANS"),
  alpha: z.number().min(0).max(1).optional().describe("Alpha 0..1"),
})

export type OklchComponents = z.infer<typeof oklchComponentsSchema>

/** Cone response space (long / medium / short), the step between OKLCH and RGB. */
export const lmsColorSchema = z.object({
  l: z.number(),
  m: z.number(),
  s: z.number(),
})

export type LmsColor = z.infer<typeof lmsColorSchema>

/** Anything `validateOklch` knows how to check. */
export type OklchInput = string | OklchColor | OklchComponents

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

/** One rung of a generated ramp. See `./shades`. */
export interface Shade {
  step: number
  l: number
  c: number
  h: number
  hex: string
  css: string
  /** False when the sRGB gamut forced the chroma below the requested value. */
  inGamut: boolean
  /** True for the step whose target lightness is closest to the base color. */
  isBase: boolean
}

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
