"use client"

import { useEffect } from "react"
import { compile } from "@repo/domain-theme/compiler"
import type { ThemeCompilationInput } from "@repo/domain-theme/compiler"
import { useThemeScope } from "./use-theme-scope"

/**
 * Hook that compiles theme scope to CSS variables and applies them to DOM.
 *
 * Monitors scope state (primary color, isDarkMode) and regenerates CSS
 * whenever they change. Applies variables to the scope's target element.
 *
 * Usage:
 * ```tsx
 * function ThemedContent() {
 *   const { scopeId } = useThemeScope()
 *   useThemeCompilation(scopeId)
 *   return <div className="themed-content">...</div>
 * }
 * ```
 *
 * Error handling: Logs warnings if compilation fails, does not throw.
 * This allows graceful degradation if primary color is invalid.
 *
 * TODO (Phase 3):
 * - Extract primary color from theme definition, not just overrides
 * - Add accent color support
 * - Consider memoizing compile() results with dependency tracking
 */
export function useThemeCompilation(scopeId: string): void {
  const { overrides, isDarkMode } = useThemeScope()

  useEffect(() => {
    if (!scopeId) return

    // Get primary color from scope overrides, or use a sensible default
    const primary = overrides.primary
    if (!primary) {
      console.warn(
        `[ThemeCompilation] No primary color in scope "${scopeId}", skipping compilation`
      )
      return
    }

    // Compile the theme
    const input: ThemeCompilationInput = {
      primary,
      isDarkMode,
    }

    const result = compile(input)

    if (!result.report.success) {
      console.warn(
        `[ThemeCompilation] Failed to compile theme for scope "${scopeId}":`,
        result.report.errors
      )
      return
    }

    // Find the target element for this scope
    // For root scope, target document.documentElement
    // For other scopes, target element with data-scope-id="scopeId"
    const targetElement =
      scopeId === "root"
        ? document.documentElement
        : document.querySelector<HTMLElement>(`[data-scope-id="${scopeId}"]`)

    if (!targetElement) {
      console.warn(
        `[ThemeCompilation] Could not find target element for scope "${scopeId}"`
      )
      return
    }

    // Apply CSS variables to target element
    for (const [key, value] of Object.entries(result.cssVariables)) {
      targetElement.style.setProperty(key, value)
    }
  }, [scopeId, overrides, isDarkMode])
}
