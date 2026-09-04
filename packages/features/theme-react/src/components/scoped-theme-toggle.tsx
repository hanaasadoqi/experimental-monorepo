"use client"

import { useThemeScopeStore } from "@repo/features-theme-react"
import { useCallback, useState, type ReactNode } from "react"

export interface ScopedThemeToggleProps {
  children?: ReactNode
  className?: string
  showAlert?: boolean
}

/**
 * Scoped dark mode toggle button.
 * Allows users to explicitly override the global theme for this component's scope.
 * Shows an optional alert explaining the override behavior.
 */
export function ScopedThemeToggle({
  children,
  className,
  showAlert = true,
}: ScopedThemeToggleProps) {
  const store = useThemeScopeStore()
  const isDarkMode = store.getState().isDarkModeEnabled
  const [showWarning, setShowWarning] = useState(false)

  const handleToggle = useCallback(() => {
    const currentState = store.getState().isDarkModeEnabled

    if (currentState === undefined) {
      if (showAlert) {
        setShowWarning(true)
        setTimeout(() => setShowWarning(false), 3000)
      }
      store.getState().setDarkMode(true)
    } else if (currentState === true) {
      store.getState().setDarkMode(false)
    } else {
      store.getState().setDarkMode(undefined)
    }
  }, [store, showAlert])

  const getLabel = () => {
    if (isDarkMode === undefined) return "Inherit Theme"
    if (isDarkMode === true) return "Dark Mode (Override)"
    return "Light Mode (Override)"
  }

  return (
    <div className={className}>
      <button
        onClick={handleToggle}
        className="px-3 py-2 rounded-md text-sm font-medium transition-colors bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        title={
          isDarkMode !== undefined
            ? "Click to inherit global theme"
            : "Click to override theme"
        }
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
