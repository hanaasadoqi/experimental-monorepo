import { luminance, tryLuminance } from "./luminance"

/**
 * WCAG compliance level contrast ratio thresholds
 */
export const CONTRAST_THRESHOLDS = {
  AA_NORMAL: 4.5, // Normal text, AA level
  AA_LARGE: 3, // Large text (18pt+), AA level
  AAA_NORMAL: 7, // Normal text, AAA level
  AAA_LARGE: 4.5, // Large text AAA level
} as const

/**
 * Calculates WCAG 2.0 contrast ratio between two colors.
 * Used to verify accessibility compliance (AA: 4.5:1, AAA: 7:1 for normal text).
 * @param foreground - OKLch color for foreground text
 * @param background - OKLch color for background
 * @returns Contrast ratio (1-21) where higher is better
 * @throws Error if either color is invalid OKLch format
 * @example
 *   contrastRatio("oklch(20% 0 0)", "oklch(95% 0 0)") // => 18.5 (AAA)
 *   contrastRatio("oklch(50% 0 0)", "oklch(55% 0 0)") // => 1.2 (fails AA)
 */
export function contrastRatio(foreground: string, background: string): number {
  const fgLuminance = luminance(foreground)
  const bgLuminance = luminance(background)
  return calculateContrastRatio(fgLuminance, bgLuminance)
}

/**
 * Calculates contrast ratio from pre-computed luminance values.
 * Useful for performance-critical paths or batch processing.
 * @param l1 - First luminance value
 * @param l2 - Second luminance value
 * @returns Contrast ratio (1-21)
 */
export function calculateContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Safely checks if two colors meet a contrast ratio requirement.
 * @param foreground - OKLch foreground color
 * @param background - OKLch background color
 * @param minRatio - Minimum acceptable ratio (e.g., 4.5 for WCAG AA)
 * @returns true if contrast >= minRatio, false if invalid or insufficient
 * @example
 *   meetsContrastRequirement(
 *     "oklch(20% 0 0)",
 *     "oklch(95% 0 0)",
 *     CONTRAST_THRESHOLDS.AA_NORMAL
 *   ) // => true
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  minRatio: number
): boolean {
  const fgLuminance = tryLuminance(foreground)
  const bgLuminance = tryLuminance(background)

  if (fgLuminance === null || bgLuminance === null) {
    return false
  }

  return calculateContrastRatio(fgLuminance, bgLuminance) >= minRatio
}
