"use client"

import type { ReactNode } from "react"

import { useAppearancePreference } from "@repo/features-preferences"

import {
  ThemeToggleHotkey,
} from "@repo/ui-theme"
import { resolveAppearance, useSystemAppearance } from "@repo/runtime-theme";

export interface AppearanceBridgeProps {
  children: ReactNode
}

export function AppearanceBridge({ children }: AppearanceBridgeProps) {
  const preference = useAppearancePreference()
  const systemAppearance = useSystemAppearance()
  const resolvedPreference = resolveAppearance(preference, systemAppearance)

  return (
    <div
      data-theme={
        resolvedPreference
      }
      color-scheme={resolvedPreference}
      className={resolvedPreference}
    >
      <ThemeToggleHotkey />
      {children}
    </div>
  )
}
