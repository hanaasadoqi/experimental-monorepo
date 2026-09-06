/**
 * Theme compilation: canonical definitions → CSS variables artifact.
 *
 * Transforms theme input (base colors + mode) into deterministic CSS custom
 * properties, deriving palettes, semantic colors, and accessible foregrounds.
 */

import {
  generateShades,
  generateHarmony,
  getAccessibleForeground,
  oklchToCss,
} from "../colors"
import type { OklchColor } from "../colors"
import type {
  ThemeCompilationInput,
  ThemeCompilationResult,
  ResolvedTheme,
  CssVariables,
} from "./model"

/**
 * Compile a theme definition into CSS variables and a resolved theme.
 * Deterministic: same input always produces identical output.
 */
export function compile(input: ThemeCompilationInput): ThemeCompilationResult {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const { primary, accent, neutral, semantic, mode } = input

    // Handle optional colors (provide defaults if needed)
    const accentColor = accent || primary
    const neutralColor = neutral || primary

    // Generate shade scales
    const primaryShades = generateShades(primary as any)
    const accentShades = generateShades(accentColor as any)
    const neutralShades = generateShades(neutralColor as any)

    // Convert base colors to CSS for accessibility testing
    const primaryCss = oklchToCss(primary)
    const accentCss = oklchToCss(accentColor)
    const neutralCss = oklchToCss(neutralColor)

    // Get accessible foreground colors (no mode needed, computes automatically)
    const primaryFg = getAccessibleForeground(primaryCss)
    const accentFg = getAccessibleForeground(accentCss)
    const neutralFg = getAccessibleForeground(neutralCss)

    // Build resolved theme
    const resolvedTheme: ResolvedTheme = {
      mode,
      colors: {
        primary,
        accent: accentColor,
        neutral: neutralColor,
        semantic: semantic || {},
      },
    }

    // Compile to CSS variables
    const cssVariables: CssVariables = {}

    // Base colors
    cssVariables["--color-primary"] = primaryCss
    cssVariables["--color-accent"] = accentCss
    cssVariables["--color-neutral"] = neutralCss

    // Foreground colors
    cssVariables["--color-primary-fg"] = primaryFg
    cssVariables["--color-accent-fg"] = accentFg
    cssVariables["--color-neutral-fg"] = neutralFg

    // Primary shades (already computed by generateShades)
    primaryShades.forEach(({ step, css }) => {
      cssVariables[`--color-primary-${step}`] = css
    })

    // Accent shades
    accentShades.forEach(({ step, css }) => {
      cssVariables[`--color-accent-${step}`] = css
    })

    // Neutral shades
    neutralShades.forEach(({ step, css }) => {
      cssVariables[`--color-neutral-${step}`] = css
    })

    // Semantic colors
    if (semantic) {
      Object.entries(semantic).forEach(([key, color]) => {
        cssVariables[`--color-semantic-${key}`] = oklchToCss(color as any)
      })
    }

    // Mode indicator
    cssVariables["--theme-mode"] = mode

    return {
      theme: resolvedTheme,
      cssVariables,
      report: { success: true, errors, warnings },
    }
  } catch (err) {
    errors.push(`Compilation error: ${err instanceof Error ? err.message : String(err)}`)
    return {
      theme: null,
      cssVariables: {},
      report: { success: false, errors, warnings },
    }
  }
}
