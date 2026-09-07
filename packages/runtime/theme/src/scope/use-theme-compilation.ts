"use client"

import { useMemo } from "react"
import type { ThemeDefinition, ThemeOverrides } from "@repo/domain-theme"
import { DEFAULT_PRIMARY_COLOR } from "@repo/domain-theme/colors"
import {
  compile,
  type ThemeCompilationInput,
} from "@repo/domain-theme/compiler"
import { useThemeRegistry } from "../registry/theme-registry-context"
import { useThemeScope } from "./use-theme-scope"

/**
 * Map a canonical source theme and flat scope overrides into the compiler's
 * flat input contract. Scope values take precedence over source values.
 */
function createCompilationInput({
  sourceTheme,
  overrides,
  enableDarkMode,
  isDarkMode,
}: {
  sourceTheme?: ThemeDefinition
  overrides: ThemeOverrides
  enableDarkMode: boolean
  isDarkMode?: boolean
}): ThemeCompilationInput {
  const accent = overrides.accent ?? sourceTheme?.colors.accent
  const harmony = overrides.harmony ?? sourceTheme?.colors.harmony

  return {
    primary:
      overrides.primary ?? sourceTheme?.colors.primary ?? DEFAULT_PRIMARY_COLOR,
    ...(accent !== undefined && { accent }),
    customAccent: overrides.customAccent ?? accent !== undefined,
    ...(harmony !== undefined && { harmony }),
    enableDarkMode,
    isDarkMode: isDarkMode ?? sourceTheme?.darkMode.isDarkMode ?? false,
  }
}

/**
 * Compile theme with overrides and return CSS variables.
 *
 * Maps the source theme definition and scope overrides into compiler input,
 * then compiles that input to CSS.
 *
 * Returns { cssVariables, report } or null if compilation fails.
 * Logs warnings on error but does not throw.
 */
export function useThemeCompilation() {
  const { overrides, enableDarkMode, isDarkMode, sourceId } = useThemeScope()
  const { getTheme } = useThemeRegistry()

  // Get source theme from registry if sourceId is set
  const sourceTheme = useMemo(() => {
    if (!sourceId) return undefined
    return getTheme(sourceId)
  }, [sourceId, getTheme])

  const input = useMemo(
    () =>
      createCompilationInput({
        sourceTheme,
        overrides,
        enableDarkMode,
        isDarkMode,
      }),
    [sourceTheme, overrides, enableDarkMode, isDarkMode]
  )

  const compilationResult = useMemo(() => {
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
  }, [input])

  return {
    cssVariables: compilationResult?.cssVariables,
    theme: compilationResult?.theme,
    compilationResult,
  }
}
