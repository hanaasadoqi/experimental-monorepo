"use client"

import { useThemeScope } from "@repo/runtime-theme"
import { useCallback, useState, type ReactNode } from "react"

export interface ScopedThemeToggleProps {
  /** Optional custom label content */
  children?: ReactNode
  /** CSS class for button styling */
  className?: string
  /** Show alert when toggling to override */
  showAlert?: boolean
}

/**
 * Scoped dark mode toggle button.
 *
 * Allows users to explicitly override the global theme for this component's scope.
 * Shows an optional alert explaining the override behavior.
 *
 * Usage:
 * ```tsx
 * <ThemeScopeProvider scopeId="preview">
 *   <ScopedThemeToggle />
 * </ThemeScopeProvider>
 * ```
 *
 * Pattern:
 * - Uses useThemeScope hook (not direct .getState() calls)
 * - Proper dependency tracking via hook subscriptions
 * - No stale closures (callback dependencies explicit)
 */
export function ScopedThemeToggle({
  children,
  className,
  showAlert = true,
}: ScopedThemeToggleProps) {
  const { enableDarkMode, isDarkMode, toggleDarkMode } = useThemeScope()
  const [showWarning, setShowWarning] = useState(false)

  // Proper useCallback with explicit dependencies
  // (isDarkMode comes from hook subscription, never stale)
  const handleToggle = useCallback(() => {
    if (!enableDarkMode) return

    if (showAlert) {
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 3000)
    }

    toggleDarkMode()
  }, [enableDarkMode, showAlert, toggleDarkMode])

  const getLabel = () => {
    if (!enableDarkMode) return "Dark Mode Unavailable"
    return isDarkMode ? "Dark Mode" : "Light Mode"
  }

  return (
    <div className={className}>
      <button
        onClick={handleToggle}
        className="px-3 py-2 rounded-md text-sm font-medium transition-colors bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        title={
          enableDarkMode
            ? "Toggle this scoped theme mode"
            : "This theme does not enable dark mode"
        }
        disabled={!enableDarkMode}
      >
        {children || getLabel()}
      </button>

      {showWarning && (
        <div className="mt-2 p-2 text-xs rounded bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          ⚠️ This scope now overrides the global theme setting
        </div>
      )}
    </div>
  )
}
