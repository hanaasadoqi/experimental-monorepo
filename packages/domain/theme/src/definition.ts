import { z } from "zod"
import { oklchColorSchema } from "./color/model"

/**
 * Canonical, versioned theme definition.
 *
 * This is the single source of truth for theme authorial data:
 * - Base color palette (primary, accent, neutral) — authorial input
 * - Typography (font families, sizes, presets)
 * - Metadata (version, name, description)
 *
 * Does NOT include runtime overrides or per-scope variations (see ThemeOverrides).
 *
 * All theme editing UIs, APIs, and persistence should reference this model.
 *
 * @example
 * const myTheme: ThemeDefinition = {
 *   version: "1.0.0",
 *   metadata: { name: "Synapcity Light", author: "Design Team" },
 *   colors: { primary: {...}, accent: {...} },
 *   typography: {
 *     fontFamilies: { body: "Inter", heading: "Geist" },
 *     presets: { default: { headingScale: 1.2 } }
 *   }
 * }
 */

/* -------------------------------------------------------------------------- */
/* Base colors: authorial data only (no runtime overrides)                    */
/* -------------------------------------------------------------------------- */

export const themeBaseColorsSchema = z.object({
  primary: oklchColorSchema.describe("Primary brand color"),
  accent: oklchColorSchema.describe("Accent/secondary color"),
  neutral: oklchColorSchema
    .optional()
    .describe("Optional neutral anchor (auto-derived if omitted)"),
})

export type ThemeBaseColors = z.infer<typeof themeBaseColorsSchema>

/* -------------------------------------------------------------------------- */
/* Typography model                                                          */
/* -------------------------------------------------------------------------- */

export const fontFamiliesSchema = z.object({
  body: z.string().describe("Font family for body text"),
  heading: z.string().describe("Font family for headings"),
  mono: z.string().optional().describe("Font family for code/monospace"),
})

export type FontFamilies = z.infer<typeof fontFamiliesSchema>

export const typographyPresetSchema = z.object({
  headingScale: z.number().default(1.2).describe("Heading size multiplier"),
  lineHeightBase: z.number().default(1.5).describe("Line height for body text"),
  lineHeightHeading: z
    .number()
    .default(1.2)
    .describe("Line height for headings"),
})

export type TypographyPreset = z.infer<typeof typographyPresetSchema>

export const typographySchema = z.object({
  fontFamilies: fontFamiliesSchema,
  presets: z
    .record(z.string(), typographyPresetSchema)
    .refine((presets) => presets.default !== undefined, {
      message: "Typography presets must include a 'default' preset",
      path: ["default"],
    })
    .describe("Typography definitions with required 'default' preset"),
})

export type Typography = z.infer<typeof typographySchema>

/* -------------------------------------------------------------------------- */
/* Theme metadata                                                            */
/* -------------------------------------------------------------------------- */

export const themeMetadataSchema = z.object({
  name: z.string().describe("Human-readable theme name"),
  author: z.string().optional().describe("Theme designer/owner"),
  description: z.string().optional().describe("Theme purpose or notes"),
  license: z.string().optional().describe("License for this theme"),
})

export type ThemeMetadata = z.infer<typeof themeMetadataSchema>

/* -------------------------------------------------------------------------- */
/* Complete theme definition (authorial data only)                           */
/* -------------------------------------------------------------------------- */

export const themeDefinitionSchema = z.object({
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .describe("Semantic version (e.g., 1.0.0)"),

  metadata: themeMetadataSchema,

  colors: themeBaseColorsSchema.describe(
    "Base color palette: primary, accent, neutral (authorial input only)"
  ),

  typography: typographySchema.describe("Typography: fonts, sizes, presets"),
})

export type ThemeDefinition = z.infer<typeof themeDefinitionSchema>

/**
 * Create a theme definition, validating all fields.
 *
 * @throws {z.ZodError} if definition is invalid
 */
export function createThemeDefinition(input: unknown): ThemeDefinition {
  return themeDefinitionSchema.parse(input)
}
