"use client"

import type { ReactNode } from "react"

import {
  useAppearancePreference,
  useSetAppearancePreference,
} from "@repo/features-preferences"

import { ThemeToggleHotkey } from "@repo/ui-theme"
import { resolveAppearance } from "@repo/runtime-theme"
import {
  useSystemAppearance,
  RootAppearanceSync,
} from "@repo/features-theme-react"
import type { ThemeMode } from "@repo/domain-theme/appearance"

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
