"use client"

import { useEffect, type ReactNode } from "react"

import {
  useAppearancePreference,
  useSetAppearancePreference,
} from "@repo/runtime-preferences"

import { ThemeToggleHotkey } from "@repo/ui-theme"
import {
  resolveAppearance,
  useThemeScope,
  useThemeStore,
} from "@repo/runtime-theme"
import { useSystemAppearance } from "@repo/adapters-theme-browser"
import type { ResolvedAppearancePreference } from "@repo/domain-preferences"

export interface AppearanceBridgeProps {
  children: ReactNode
}

export function AppearanceBridge({ children }: AppearanceBridgeProps) {
  const preference = useAppearancePreference()
  const systemAppearance = useSystemAppearance()
  const resolvedPreference = resolveAppearance(preference, systemAppearance)
  const setPreference = useSetAppearancePreference()
  const { setDarkMode } = useThemeScope()
  const setGlobalThemeDarkMode = useThemeStore(
    (state) => state.setGlobalDarkMode
  )

  // Keep the root scope's dark mode reacting to the resolved preference.
  // The scope store initializes its dark mode once at mount (from the initial
  // overrides, before system appearance has resolved), so without this the
  // scope stays stuck on that first value while the resolved preference and
  // <html> move on — leaving the scope and document themes disagreeing.
  useEffect(() => {
    setDarkMode(resolvedPreference === "dark")
    setGlobalThemeDarkMode(resolvedPreference === "dark")
  }, [resolvedPreference, setDarkMode, setGlobalThemeDarkMode])

  const handleAppearanceChange = (next: ResolvedAppearancePreference) => {
    const nextIsDarkMode = next === "dark"
    setDarkMode(nextIsDarkMode)
    setGlobalThemeDarkMode(nextIsDarkMode)
    setPreference(next)
  }

  return (
    <>
      <ThemeToggleHotkey
        resolvedAppearance={resolvedPreference}
        onAppearanceChange={handleAppearanceChange}
      />
      {children}
    </>
  )
}
