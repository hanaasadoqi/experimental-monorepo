/**
 * Theme constants and defaults
 */

// OKLCH color regex — exported as constant for reuse
export const OKLCH_REGEX = /^oklch\(([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\)$/

// Default theme configuration
export const DEFAULT_THEME = {
  appearance: 'system' as const,
  accentColor: 'oklch(65% 0.15 250)'
} as const

export const DEFAULT_APPEARANCE_MODE = 'system' as const

// OKLCH color constraints
export const OKLCH_CONSTRAINTS = {
  lightness: { min: 0, max: 100 },
  chroma: { min: 0, max: 0.4 },
  hue: { min: 0, max: 360 }
} as const
