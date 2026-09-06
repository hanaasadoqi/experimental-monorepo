/**
 * Theme compilation: canonical definitions → CSS variables artifact.
 *
 * Transforms theme input (base colors + mode) into deterministic CSS custom
 * properties, deriving palettes, semantic colors, and accessible foregrounds.
 *
 * Deterministic: same input always produces identical output.
 * No side effects, no async operations.
 */

import { DEFAULT_OKLCH } from "../colors"
import {
  generateShades,
  getAccessibleForeground,
  Oklch,
  oklchToCss,
  toOklch,
  validateOklch,
} from "../colors"
import type {
  ThemeCompilationInput,
  ThemeCompilationResult,
  ResolvedTheme,
  CssVariables,
  ThemeCompilationReport,
} from "./model"

/**
 * Compile a theme definition into CSS variables and a resolved theme.
 *
 * @param input Theme colors and mode settings
 * @returns Compilation result with resolved theme, CSS variables, and report
 */
export function compile(input: ThemeCompilationInput): ThemeCompilationResult {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const {
      primary,
      accent,
      isDarkMode,
      enableDarkMode,
      customAccent,
      harmony,
    } = input

    // Validate primary color is required
    if (!primary) {
      errors.push("Primary color is required")
      return {
        theme: null,
        cssVariables: {},
        report: createReport(false, errors, warnings),
      }
    }

    // Normalize and validate primary color
    let primaryOklch
    try {
      primaryOklch = toOklch(primary)
      const validation = validateOklch(primary)
      if (!validation.success) {
        errors.push(`Invalid primary color: ${String(validation.error)}`)
        return {
          theme: null,
          cssVariables: {},
          report: createReport(false, errors, warnings),
        }
      }
    } catch (err) {
      errors.push(
        `Failed to parse primary color: ${err instanceof Error ? err.message : String(err)}`
      )
      return {
        theme: null,
        cssVariables: {},
        report: createReport(false, errors, warnings),
      }
    }

    // Normalize accent color if provided
    let accentOklch
    if (customAccent && accent) {
      try {
        accentOklch = toOklch(accent)
        const validation = validateOklch(accent)
        if (!validation.success) {
          warnings.push(
            `Invalid accent color: ${String(validation.error)}, using primary only`
          )
          accentOklch = undefined
        }
      } catch (err) {
        warnings.push(
          `Failed to parse accent color: ${err instanceof Error ? err.message : String(err)}, using primary only`
        )
        accentOklch = undefined
      }
    }

    // Get accessible foreground colors
    const primaryBg = getBackgroundForColor(primaryOklch, isDarkMode)
    const accentBg = accentOklch
      ? getBackgroundForColor(accentOklch, isDarkMode)
      : undefined
    const defaultBg = getBackgroundForColor(DEFAULT_OKLCH, isDarkMode)
    const primaryBgCss = oklchToCss(primaryBg)
    const accentBgCss = accentBg ? oklchToCss(accentBg) : undefined
    const defaultBgCss = oklchToCss(defaultBg)
    const primaryFg = getAccessibleForeground(primaryBgCss)
    const accentFg = accentBgCss
      ? getAccessibleForeground(accentBgCss)
      : undefined
    const defaultFg = getAccessibleForeground(defaultBgCss)

    // Build resolved theme
    const resolvedTheme: ResolvedTheme = {
      isDarkMode,
      colors: {
        primary,
        ...(customAccent && accentOklch ? { accent } : {}),
        ...(harmony ? { harmony } : {}),
      },
    }

    // Generate shade scales
    const primaryShades = generateShades(primaryOklch)
    const accentShades = accentOklch ? generateShades(accentOklch) : []
    const defaultShades = generateShades(DEFAULT_OKLCH)

    // Compile to CSS variables
    const cssVariables: CssVariables = {}

    // Primary palette (shades based on actual primary color)
    cssVariables["--color-primary"] = primaryBgCss
    cssVariables["--color-primary-fg"] = primaryFg
    primaryShades.forEach(({ step, css }) => {
      cssVariables[`--color-primary-${step}`] = css
    })

    // Accent palette (shades based on actual accent color if provided)
    if (accentOklch && accentBgCss) {
      cssVariables["--color-accent"] = accentBgCss
      cssVariables["--color-accent-fg"] = accentFg!
      accentShades.forEach(({ step, css }) => {
        cssVariables[`--color-accent-${step}`] = css
      })
    }

    // Default/neutral palette (shades based on actual DEFAULT_OKLCH)
    cssVariables["--color-default"] = defaultBgCss
    cssVariables["--color-default-fg"] = defaultFg
    defaultShades.forEach(({ step, css }) => {
      cssVariables[`--color-default-${step}`] = css
    })

    // Theme mode indicator
    cssVariables["--theme-mode"] =
      enableDarkMode === true ? "light" : isDarkMode ? "dark" : "light"

    // TODO: Semantic color derivation (Phase 2.5)
    // - Error, warning, success, info semantic colors
    // - Derived from accessibility requirements
    // - Per-mode overrides

    return {
      theme: resolvedTheme,
      cssVariables,
      report: createReport(true, errors, warnings),
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    errors.push(`Compilation error: ${errorMsg}`)
    return {
      theme: null,
      cssVariables: {},
      report: createReport(false, errors, warnings),
    }
  }
}

/**
 * Get background color for a given color based on mode.
 * Dark mode: returns darkest shade (step 950)
 * Light mode: returns lightest shade (step 50)
 */
function getBackgroundForColor(
  color: Oklch,
  isDarkMode: boolean | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const shades = generateShades(color)
  // Shades are ordered 50, 100, 200, ..., 950
  return isDarkMode
    ? shades[shades.length - 1]?.l !== undefined
      ? {
          l: shades[shades.length - 1]?.l,
          c: shades[shades.length - 1]?.c,
          h: shades[shades.length - 1]?.h,
        }
      : color
    : shades[0]?.l !== undefined
      ? {
          l: shades[0].l,
          c: shades[0].c,
          h: shades[0].h,
        }
      : color
}

/**
 * Helper to create a compilation report.
 */
function createReport(
  success: boolean,
  errors: string[],
  warnings: string[]
): ThemeCompilationReport {
  return {
    success,
    errors,
    warnings,
  }
}
