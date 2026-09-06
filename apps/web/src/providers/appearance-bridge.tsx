"use client"

import { useEffect, useState, type ReactNode } from "react"

import {
  useAppearancePreference,
  useSetAppearancePreference,
} from "@repo/features-preferences"

import { ThemeToggleHotkey } from "@repo/ui-theme"
import { resolveAppearance } from "@repo/runtime-theme"
import {
  detectSystemAppearance,
  subscribeToSystemAppearanceChanges,
  applyAppearanceToDocument,
} from "@repo/adapters-theme-browser"
import type { ThemeMode } from "@repo/domain-theme/appearance"

function useSystemAppearance(): ThemeMode {
  const [systemAppearance, setSystemAppearance] = useState<ThemeMode>(() =>
    detectSystemAppearance()
  )

  useEffect(() => {
    const unsubscribe = subscribeToSystemAppearanceChanges(setSystemAppearance)
    return unsubscribe
  }, [])

  return systemAppearance
}

function RootAppearanceSync({ appearance }: { appearance: ThemeMode }) {
  useEffect(() => {
    applyAppearanceToDocument(appearance)
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
