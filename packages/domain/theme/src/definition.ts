import { z } from "zod"
import { themeColorsSchema, type ThemeColors } from "./theme/model"

/**
 * Canonical, versioned theme definition.
 *
 * This is the single source of truth for theme authorial data:
 * - Color palette (primary, accent, semantic)
 * - Typography (font families, sizes, weights)
 * - Metadata (version, name, description)
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
  lineHeightHeading: z.number().default(1.2).describe("Line height for headings"),
})

export type TypographyPreset = z.infer<typeof typographyPresetSchema>

export const typographySchema = z.object({
  fontFamilies: fontFamiliesSchema,
  presets: z.record(z.string(), typographyPresetSchema).optional(),
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
/* Complete theme definition                                                 */
/* -------------------------------------------------------------------------- */

export const themeDefinitionSchema = z.object({
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .describe("Semantic version (e.g., 1.0.0)"),

  metadata: themeMetadataSchema,

  colors: themeColorsSchema.describe("Color palette: primary, accent, semantic"),

  typography: typographySchema.describe("Typography: fonts, sizes, presets"),
})

export type ThemeDefinition = z.infer<typeof themeDefinitionSchema>

/**
 * Create a theme definition, validating all fields.
 *
 * @throws {z.ZodError} if definition is invalid
 */
export function createThemeDefinition(
  input: unknown
): ThemeDefinition {
  return themeDefinitionSchema.parse(input)
}
