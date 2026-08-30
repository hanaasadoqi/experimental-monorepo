"use client"

import type { ReactNode } from "react"

import {
  PreferencesProvider,
  useAppearancePreference,
  useSetAppearancePreference,
} from "@repo/feature-preferences"
import {
  AppearanceRuntimeProvider,
  ThemeToggleHotkey,
} from "@repo/feature-theme"
import type { AppearancePreference } from "@repo/shared-contracts"

export interface ApplicationProvidersProps {
  children: ReactNode
  initialPreference?: AppearancePreference
}

function AppearanceBridge({ children }: { children: ReactNode }) {
  const preference = useAppearancePreference()
  const setPreference = useSetAppearancePreference()

  return (
    <AppearanceRuntimeProvider
      preference={preference}
      onPreferenceChange={setPreference}
    >
      <ThemeToggleHotkey />
      {children}
    </AppearanceRuntimeProvider>
  )
}

export function ApplicationProviders({
  children,
  initialPreference,
}: ApplicationProvidersProps) {
  return (
    <PreferencesProvider
      {...(initialPreference === undefined ? {} : { initialAppearance: initialPreference })}
    >
      <AppearanceBridge>{children}</AppearanceBridge>
    </PreferencesProvider>
  )
}
