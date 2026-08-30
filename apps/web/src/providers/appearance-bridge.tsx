"use client"

import type { ReactNode } from "react"

import { useAppearancePreference } from "@repo/feature-preferences"

import {
  AppearanceRuntimeProvider,
  ThemeToggleHotkey,
} from "@repo/feature-theme"

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
