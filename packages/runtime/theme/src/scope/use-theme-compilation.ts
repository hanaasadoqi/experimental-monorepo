"use client"

import { useMemo } from "react"
import { compile } from "@repo/domain-theme/compiler"
import type { ThemeCompilationInput } from "@repo/domain-theme/compiler"
import { useThemeScope } from "./use-theme-scope"
import { useThemeRegistry } from "../registry/theme-registry-context"

/**
 * Merge source theme with scope overrides to get the full theme for compilation.
 *
 * Priority: overrides take precedence over source theme properties.
 * Returns the merged theme object ready for compile().
 */
function mergeThemeWithOverrides(sourceTheme: any, overrides: any) {
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
    return mergeThemeWithOverrides(sourceTheme || {}, overrides)
  }, [sourceTheme, overrides])

  // Compile merged theme to CSS variables
  const compilationResult = useMemo(() => {
    if (!mergedTheme.primary) {
      return null
    }

    const input: ThemeCompilationInput = {
      primary: mergedTheme.primary,
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
  }, [mergedTheme.primary, isDarkMode])

  return {
    cssVariables: compilationResult?.cssVariables,
    theme: mergedTheme,
    compilationResult,
  }
}
