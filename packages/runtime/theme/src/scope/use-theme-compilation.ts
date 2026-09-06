"use client"

import { useMemo } from "react"
import { compile } from "@repo/domain-theme/compiler"
import type { ThemeCompilationInput } from "@repo/domain-theme/compiler"
import { useThemeScope } from "./use-theme-scope"
import { useThemeRegistry } from "../registry/theme-registry-context"
import { ThemeDefinition } from "@repo/domain-theme";

/**
 * Merge source theme with scope overrides to get the full theme for compilation.
 *
 * Priority: overrides take precedence over source theme properties.
 * Returns the merged theme object ready for compile().
 */
function mergeThemeWithOverrides(sourceTheme: ThemeDefinition, overrides: Partial<ThemeDefinition>): ThemeDefinition {
  return {
    ...sourceTheme,
    ...overrides,
  }
}

/**
 * Compile theme with overrides and return CSS variables.
 *
 * Merges the source theme definition (colors, settings) with scope overrides
 * (user's custom primary color, dark mode toggle, etc.) and compiles to CSS.
 *
 * Returns { cssVariables, report } or null if compilation fails.
 * Logs warnings on error but does not throw.
 */
export function useThemeCompilation() {
  const { overrides, isDarkMode, sourceId } = useThemeScope()
  const { getTheme } = useThemeRegistry()

  // Get source theme from registry if sourceId is set
  const sourceTheme = useMemo(() => {
    if (!sourceId) return null
    return getTheme(sourceId)
  }, [sourceId, getTheme])

  // Merge source theme with scope overrides
  const mergedTheme = useMemo(() => {
    return mergeThemeWithOverrides(sourceTheme ?? {} as ThemeDefinition, overrides as Partial<ThemeDefinition>)
  }, [sourceTheme, overrides])

  const compilationResult = useMemo(() => {
    if (!mergedTheme.colors.primary) {
      return null
    }

    const input: ThemeCompilationInput = {
      primary: mergedTheme.colors.primary,
      isDarkMode: isDarkMode ?? false,
    }

    try {
      const result = compile(input)
      if (!result.report.success) {
        console.warn(
          `[ThemeCompilation] Failed to compile theme:`,
          result.report.errors
        )
        return null
      }
      return result
    } catch (error) {
      console.warn(`[ThemeCompilation] Compilation error:`, error)
      return null
    }
  }, [mergedTheme.colors.primary, isDarkMode])

  return {
    cssVariables: compilationResult?.cssVariables,
    theme: mergedTheme,
    compilationResult,
  }
}
