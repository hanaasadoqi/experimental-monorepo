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
    const { primary, accent, isDarkMode, customAccent, harmony } = input

    // Validate primary color is required
    if (!primary) {
      errors.push(
        "Primary color is required: all theme definitions need a base color for shade palette generation"
      )
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

    // isDarkMode is the resolved appearance (already determined at Runtime layer)
    const shouldUseDarkMode = isDarkMode

    // Get accessible foreground colors
    let primaryBg: Oklch
    let accentBg: Oklch | undefined
    let defaultBg: Oklch

    try {
      const primaryBgResult = getBackgroundForColor(
        primaryOklch,
        shouldUseDarkMode
      )
      if (!primaryBgResult) {
        errors.push("Failed to generate background shade for primary color")
        return {
          theme: null,
          cssVariables: {},
          report: createReport(false, errors, warnings),
        }
      }
      primaryBg = primaryBgResult

      if (accentOklch) {
        const accentBgResult = getBackgroundForColor(
          accentOklch,
          shouldUseDarkMode
        )
        if (accentBgResult) {
          accentBg = accentBgResult
        } else {
          warnings.push("Failed to generate background shade for accent color")
        }
      }

      const defaultBgResult = getBackgroundForColor(
        DEFAULT_OKLCH,
        shouldUseDarkMode
      )
      if (!defaultBgResult) {
        errors.push("Failed to generate background shade for default color")
        return {
          theme: null,
          cssVariables: {},
          report: createReport(false, errors, warnings),
        }
      }
      defaultBg = defaultBgResult
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      errors.push(`Shade generation error: ${errorMsg}`)
      return {
        theme: null,
        cssVariables: {},
        report: createReport(false, errors, warnings),
      }
    }

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
      isDarkMode: shouldUseDarkMode,
      colors: {
        primary,
        ...(customAccent && accentOklch ? { accent } : {}),
        ...(harmony ? { harmony } : {}),
      },
    }

    // Generate shade scales and compile to CSS variables
    const cssVariables: CssVariables = {}

    // Define all palettes (primary is always included, accent only if valid)
    type Palette = {
      name: string
      oklch: Oklch
      baseColor: string
      foreground: string
      background: string
    }

    const palettes: Palette[] = [
      {
        name: "primary",
        oklch: primaryOklch,
        baseColor: primaryBgCss,
        foreground: primaryFg,
        background: primaryBgCss,
      },
      ...(accentOklch && accentBgCss
        ? [
            {
              name: "accent",
              oklch: accentOklch,
              baseColor: accentBgCss,
              foreground: accentFg!,
              background: accentBgCss,
            },
          ]
        : []),
      {
        name: "default",
        oklch: DEFAULT_OKLCH,
        baseColor: defaultBgCss,
        foreground: defaultFg,
        background: defaultBgCss,
      },
    ]

    // Compile each palette to CSS variables (DRY: single loop pattern)
    for (const palette of palettes) {
      const shades = generateShades(palette.oklch)

      // Base color and foreground
      cssVariables[`--color-${palette.name}`] = palette.baseColor
      cssVariables[`--color-${palette.name}-fg`] = palette.foreground
      cssVariables[`--color-${palette.name}-bg`] = palette.background

      // Shade steps (50, 100, 200, ..., 950)
      for (const shade of shades) {
        cssVariables[`--color-${palette.name}-${shade.step}`] = shade.css
      }
    }

    // Theme mode indicator
    cssVariables["--theme-mode"] = shouldUseDarkMode ? "dark" : "light"

    // Phase 3: Semantic color derivation
    // Future work to add: error, warning, success, info semantic colors
    // These will be derived from accessibility requirements and provide per-mode overrides
    // See architecture guide for semantic color strategy

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
 *
 * @param color Base OKLCH color to derive shade from
 * @param isDarkMode Whether to use dark mode (950 step) or light mode (50 step)
 * @returns The selected shade as OKLCH color, or null if shade generation failed
 * @throws {Error} If required shade properties are missing
 */
function getBackgroundForColor(
  color: Oklch,
  isDarkMode: boolean | undefined
): Oklch | null {
  const shades = generateShades(color)

  // Find specific shade step: use 950 for dark mode, 50 for light mode
  const targetStep = isDarkMode ? 950 : 50
  const shade = shades.find((s) => s.step === targetStep)

  if (!shade) {
    // Shade generation failed to produce required step
    return null
  }

  // Validate all required properties exist
  if (shade.l === undefined || shade.c === undefined || shade.h === undefined) {
    throw new Error(
      `Shade step ${targetStep} missing required properties: ` +
        `l=${shade.l}, c=${shade.c}, h=${shade.h}`
    )
  }

  return { l: shade.l, c: shade.c, h: shade.h }
}

/**
 * Create a compilation report with success status and diagnostic messages.
 *
 * Reports capture non-fatal issues (warnings) and blocking errors.
 * Used for debugging compilation failures and tracking degradation (e.g., missing accent).
 *
 * @param success Whether compilation succeeded without errors
 * @param errors Fatal issues that prevented full compilation
 * @param warnings Non-fatal issues (accent missing, shape generation incomplete)
 * @returns Report object with all diagnostic information
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
