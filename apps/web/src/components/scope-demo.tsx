"use client"

import { useEffect, useRef } from "react"

import { applyScopeThemeToElement } from "@repo/adapters-theme-browser"
import { ThemeScopeProvider, useThemeScope } from "@repo/runtime-theme"
import { ScopedThemeToggle } from "@repo/ui-theme/components"
import { useResolvedAppearance } from "../hooks/use-resolved-appearance"

const demoTheme = { enableDarkMode: true } as const

function ScopeDemoContent() {
  const scopeRef = useRef<HTMLDivElement>(null)
  const {
    isDarkMode,
    overrides,
    setPrimaryColor,
    enableDarkMode,
    toggleEnableDarkMode,
  } = useThemeScope()

  useEffect(() => {
    if (!scopeRef.current) return

    applyScopeThemeToElement(scopeRef.current, {
      isDarkMode: enableDarkMode && isDarkMode,
      primaryColor: overrides.primary,
    })
  }, [enableDarkMode, isDarkMode, overrides.primary])

  return (
    <div
      ref={scopeRef}
      className="border-primary rounded-lg border-2 border-dashed p-6"
      suppressHydrationWarning
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">Scoped Theme Demo</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Customize this section independently
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => toggleEnableDarkMode()}
            className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            {enableDarkMode ? "Disable Dark Mode" : "Enable Dark Mode"}
          </button>

          <div className="flex gap-2">
            {["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B"].map((color) => (
              <button
                key={color}
                onClick={() => setPrimaryColor(color)}
                className="h-8 w-8 rounded transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          <div className="text-xs text-gray-600 dark:text-gray-400">
            <div>Dark mode: {isDarkMode ? "ON" : "OFF"}</div>
            {overrides?.primary && (
              <div>Primary color: {overrides.primary}</div>
            )}
          </div>
        </div>

        <ScopedThemeToggle />
      </div>
    </div>
  )
}

export function ScopeDemo() {
  const resolvedAppearance = useResolvedAppearance()

  return (
    <ThemeScopeProvider
      scopeId="demo"
      overrides={{
        ...demoTheme,
        enableDarkMode: demoTheme.enableDarkMode,
        isDarkMode: demoTheme.enableDarkMode && resolvedAppearance === "dark",
      }}
    >
      <ScopeDemoContent />
    </ThemeScopeProvider>
  )
}
