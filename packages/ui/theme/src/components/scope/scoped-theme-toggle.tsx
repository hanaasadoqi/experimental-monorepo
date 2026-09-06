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
  const { isDarkModeEnabled, setDarkMode } = useThemeScope()
  const [showWarning, setShowWarning] = useState(false)

  // Proper useCallback with explicit dependencies
  // (isDarkModeEnabled comes from hook subscription, never stale)
  const handleToggle = useCallback(() => {
    const currentState = isDarkModeEnabled

    if (currentState === undefined) {
      // Currently inheriting global theme; toggle to explicit override
      if (showAlert) {
        setShowWarning(true)
        setTimeout(() => setShowWarning(false), 3000)
      }
      setDarkMode(true)
    } else if (currentState === true) {
      // Currently in dark mode override; toggle to light mode
      setDarkMode(false)
    } else {
      // Currently in light mode override; toggle back to inherit
      setDarkMode(undefined)
    }
  }, [isDarkModeEnabled, setDarkMode, showAlert])

  const getLabel = () => {
    if (isDarkModeEnabled === undefined) return "Inherit Theme"
    if (isDarkModeEnabled === true) return "Dark Mode (Override)"
    return "Light Mode (Override)"
  }

  return (
    <div className={className}>
      <button
        onClick={handleToggle}
        className="px-3 py-2 rounded-md text-sm font-medium transition-colors bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        title={
          isDarkModeEnabled !== undefined
            ? "Click to inherit global theme"
            : "Click to override theme"
        }
        disabled={!isDarkModeEnabled}
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
