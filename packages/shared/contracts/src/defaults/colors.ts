import type { OklchStr } from "../schemas/colors.js"

// OKLCH color regex — exported as constant for reuse
export const OKLCH_REGEX = /^oklch\(([\d.]+)(%?)?\s+([\d.]+)\s+([\d.]+)\)$/

export const DEFAULT_PRIMARY_BASE: OklchStr = "oklch(65% 0.15 250)"

export const MIN_LIGHTNESS = 0
export const MAX_LIGHTNESS = 100
export const MIN_CHROMA = 0
export const MAX_CHROMA = 0.4
export const MIN_HUE = 0
export const MAX_HUE = 360

// OKLCH color constraints
export const OKLCH_CONSTRAINTS = {
  lightness: { min: MIN_LIGHTNESS, max: MAX_LIGHTNESS },
  chroma: { min: MIN_CHROMA, max: MAX_CHROMA },
  hue: { min: MIN_HUE, max: MAX_HUE },
} as const

/**
 * WCAG compliance level contrast ratio thresholds
 */
export const CONTRAST_THRESHOLDS = {
  AA_NORMAL: 4.5, // Normal text, AA level
  AA_LARGE: 3, // Large text (18pt+), AA level
  AAA_NORMAL: 7, // Normal text, AAA level
  AAA_LARGE: 4.5, // Large text AAA level
} as const
