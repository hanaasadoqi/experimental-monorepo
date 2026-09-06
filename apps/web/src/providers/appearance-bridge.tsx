"use client"

import { type ReactNode } from "react"

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
