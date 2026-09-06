"use client"

import { useEffect, useState, type ReactNode } from "react"

import {
  useAppearancePreference,
  useSetAppearancePreference,
} from "@repo/features-preferences"

import { ThemeToggleHotkey } from "@repo/ui-theme"
import { resolveAppearance } from "@repo/runtime-theme"
import type { ThemeMode } from "@repo/domain-theme/appearance"

/**
 * Hook to detect system dark mode preference.
 * Returns 'dark' | 'light' based on matchMedia.
 */
function useSystemAppearance(): ThemeMode {
  const [systemAppearance, setSystemAppearance] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e: MediaQueryListEvent) => {
      setSystemAppearance(e.matches ? "dark" : "light")
    }

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  return systemAppearance
}

/**
 * Component to sync appearance to DOM.
 * Applies appearance as className and data attribute.
 */
function RootAppearanceSync({ appearance }: { appearance: ThemeMode }) {
  useEffect(() => {
    if (typeof window === "undefined") return
    const root = document.documentElement
    root.className = appearance
    root.setAttribute("data-theme", appearance)
  }, [appearance])

  return null
}

export interface AppearanceBridgeProps {
  children: ReactNode
}

export function AppearanceBridge({ children }: AppearanceBridgeProps) {
  const preference = useAppearancePreference()
  const systemAppearance = useSystemAppearance()
  const resolvedPreference = resolveAppearance(preference, systemAppearance)
  const setPreference = useSetAppearancePreference()

  const handleAppearanceChange = (next: ThemeMode) => {
    setPreference(next)
  }

  return (
    <div data-theme={resolvedPreference} className={resolvedPreference}>
      <RootAppearanceSync appearance={resolvedPreference} />
      <ThemeToggleHotkey
        resolvedAppearance={resolvedPreference}
        onAppearanceChange={handleAppearanceChange}
      />
      {children}
    </div>
  )
}
