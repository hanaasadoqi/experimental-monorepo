import { z } from "zod"

import {
  COLOR_TYPE_OPTIONS,
  MAX_CHROMA,
  MAX_HUE,
  MAX_LIGHTNESS,
  MIN_CHROMA,
  MIN_HUE,
  MIN_LIGHTNESS,
  OKLCH_REGEX,
} from "../constants"

/**
 * ARCHITECTURE: Three distinct color representations
 *
 * |                  | Serialized        | Normalized        | Components          |
 * |------------------|-------------------|-------------------|---------------------|
 * | Oklch            | OklchString       | OklchColor        | OklchComponents     |
 * | Hex              | HexString         | (same)            | —                   |
 * | RGB              | RgbString         | RgbColor          | —                   |
 * | Hue unit         | degrees/template  | degrees (0..360)  | radians (math)      |
 * | Use case         | CSS/I/O           | persisted/display | transformations     |
 * | Safe to index    | NO - strings      | YES - objects     | YES - objects       |
 *
 * RULE: Never put string types in unions with data types. Parse first, then operate.
 */

/* -------------------------------------------------------------------------- */
/* OKLCH: Three representations                                               */
/* -------------------------------------------------------------------------- */

/** CSS oklch() function string. Compile-time shape only — validate at runtime. */
export const oklchStrSchema = z
  .string()
  .regex(OKLCH_REGEX)
  .transform((value) => value as OklchString)

export type OklchString = `oklch(${string})`

/** Persisted / displayed OKLCH: hue in degrees (0-360). */
export const oklchColorSchema = z.object({
  l: z
    .number()
    .min(MIN_LIGHTNESS)
    .max(MAX_LIGHTNESS)
    .describe("Lightness 0..1"),
  c: z.number().min(MIN_CHROMA).max(MAX_CHROMA).describe("Chroma 0..0.4"),
  h: z.number().min(MIN_HUE).max(MAX_HUE).describe("Hue in degrees, 0..360"),
  a: z.number().min(0).max(1).optional().describe("Alpha 0..1"),
})

export type OklchColor = z.infer<typeof oklchColorSchema>

/** Computation form: hue in RADIANS for Math.cos/sin. Field names: lightness, chroma, hue (for clarity). */
export const oklchComponentsSchema = z.object({
  lightness: z.number().describe("Lightness 0..1"),
  chroma: z.number().describe("Chroma >= 0"),
  hue: z.number().describe("Hue in RADIANS for Math.cos/sin"),
  a: z.number().min(0).max(1).optional().describe("Alpha 0..1"),
})

export type OklchComponents = z.infer<typeof oklchComponentsSchema>

/**
 * Unified type for any indexable OKLCH (never string).
 * Use this when you need `.l`, `.c`, `.h` safely.
 */
export type OklchObject = OklchColor | OklchComponents

/** Accept any form at boundaries, but parse to OklchObject before operating. */
export type OklchInput = OklchString | OklchColor | OklchComponents

export const DEFAULT_OKLCH: OklchColor = { l: 0.5, c: 0.1, h: 200 }

/** Backward-compat alias: OklchColor only (persisted form with l, c, h). */
export type Oklch = OklchColor

/* -------------------------------------------------------------------------- */
/* HEX: Two representations                                                    */
/* -------------------------------------------------------------------------- */

/** CSS hex string (#rrggbb or #rgb). */
export const hexStrSchema = z
  .string()
  .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  .transform((value) => value as HexString)

export type HexString = `#${string}`

/** Normalized hex object (not used, but included for symmetry with RGB/Oklch). */
export const hexColorSchema = z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)

export type HexColor = z.infer<typeof hexColorSchema>

/** Unified type for hex. */
export type HexObject = HexColor | HexString

export type HexInput = HexString | HexColor

export const DEFAULT_HEX: HexString = "#000000"

/* -------------------------------------------------------------------------- */
/* RGB: Two representations                                                    */
/* -------------------------------------------------------------------------- */

/**
 * CSS rgb()/rgba() function string. The two function names are not
 * interchangeable here: `rgb()` never carries alpha and `rgba()` always
 * does, matching what `rgbToCss` (convert.ts) actually emits — a single
 * regex with an optional alpha group would accept `rgb(...)` with alpha and
 * `rgba(...)` without it, which the serializer never produces.
 */
export const rgbStrSchema = z
  .string()
  .regex(
    /^(?:rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\))$/i
  )
  .transform((value) => value as RgbString)

export type RgbString = `rgb(${string})` | `rgba(${string})`

/** Normalized RGB: 0-1 range. */
export const rgbColorSchema = z.object({
  r: z.number().min(0).max(1),
  g: z.number().min(0).max(1),
  b: z.number().min(0).max(1),
  a: z.number().min(0).max(1).optional(),
})

export type RgbColor = z.infer<typeof rgbColorSchema>

/** Unified type for any indexable RGB (never string). */
export type RgbObject = RgbColor

export type RgbInput = RgbString | RgbColor

export const DEFAULT_RGB: RgbColor = { r: 0, g: 0, b: 0 }

/* -------------------------------------------------------------------------- */
/* Unified input/output types for converters                                   */
/* -------------------------------------------------------------------------- */

/**
 * Any color that can be DISPLAYED or SERIALIZED (includes strings).
 * Use at I/O boundaries (React props, CSS output).
 */
export type AnyColorInput = OklchInput | HexInput | RgbInput

/**
 * Any color that can be OPERATED ON (never strings).
 * Use after parsing, before accessing `.l`, `.r`, etc.
 */
export type AnyColorObject = OklchObject | RgbObject

/** LMS: intermediate color space for OKLCH transforms. */
export const lmsColorSchema = z.object({
  l: z.number(),
  m: z.number(),
  s: z.number(),
})

export type LmsColor = z.infer<typeof lmsColorSchema>

/* -------------------------------------------------------------------------- */
/* Color scale (discrete palette)                                              */
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

export const COLOR_HARMONY_OPTIONS = [
  "analogous",
  "complementary",
  "split-complementary",
  "triadic",
  // "tetradic" is ambiguous (per the color-system repair contract) — kept
  // for backward compatibility as an alias of "square" (identical 90°
  // geometry, see harmony.ts), not removed per the no-deletion policy.
  "tetradic",
  "square",
  "rectangle",
  "double-split-complementary",
  "monochromatic",
] as const

export type ColorHarmonyOption = (typeof COLOR_HARMONY_OPTIONS)[number]
export const colorHarmonySchema = z.enum(COLOR_HARMONY_OPTIONS)

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

export const DEFAULT_COLOR_TYPE = "oklch"
export const colorTypeSchema = z.enum(COLOR_TYPE_OPTIONS)
export type CssColorType = z.infer<typeof colorTypeSchema>
