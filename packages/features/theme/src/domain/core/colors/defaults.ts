/**
 * OKLch Color Space Representation
 *
 * Represents a color in cylindrical OKLch (lightness, chroma, hue) format.
 * Perceptually uniform for both lightness and colorfulness.
 *
 * @see {@link https://oklab.github.io|OKLab specification}
 */

// Local type definitions for color utilities
export type oklchColor = {
  lightness: number
  chroma: number
  hue: number
  alpha?: number
}

export type OklchStr = `oklch(${string})`

export type lmsColor = {
  l: number
  m: number
  s: number
}

// OKLch regex and schemas (basic placeholder)
export const OKLCH_REGEX = /^oklch\(([\d.]+)(%?)?\s+([\d.]+)\s+([\d.]+)\)$/

// Placeholder schemas - actual validation can be done at runtime
export const oklchColorSchema = {
  safeParse: (value: unknown): { success: boolean; data?: oklchColor } => {
    if (
      typeof value === "object" &&
      value !== null &&
      "lightness" in value &&
      "chroma" in value &&
      "hue" in value
    ) {
      return {
        success: true,
        data: value as oklchColor,
      }
    }
    return { success: false }
  },
}

export const oklchStrSchema = {
  safeParse: (value: unknown): { success: boolean; data?: OklchStr } => {
    if (typeof value === "string" && OKLCH_REGEX.test(value)) {
      return {
        success: true,
        data: value as OklchStr,
      }
    }
    return { success: false }
  },
}

// WCAG compliance level contrast ratio thresholds
export const CONTRAST_THRESHOLDS = {
  AA_NORMAL: 4.5, // Normal text, AA level
  AA_LARGE: 3, // Large text (18pt+), AA level
  AAA_NORMAL: 7, // Normal text, AAA level
  AAA_LARGE: 4.5, // Large text AAA level
} as const
