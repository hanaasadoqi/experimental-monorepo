"use client"

import type { ReactNode } from "react"

import { useAppearancePreference } from "@repo/features-preferences"

import {
  AppearanceRuntimeProvider,
  ThemeToggleHotkey,
} from "@repo/features-theme"

export interface AppearanceBridgeProps {
  children: ReactNode
}

export function AppearanceBridge({ children }: AppearanceBridgeProps) {
  const preference = useAppearancePreference()

  return (
    <AppearanceRuntimeProvider preference={preference}>
      <ThemeToggleHotkey />
      {children}
    </AppearanceRuntimeProvider>
  )
}
