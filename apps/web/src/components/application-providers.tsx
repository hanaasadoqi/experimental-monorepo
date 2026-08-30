"use client"

import { useMemo, type ReactNode } from "react"

import {
  PreferencesProvider,
  createCookiePreferencesAdapter,
  useAppearancePreference,
  useSetAppearancePreference,
} from "@repo/feature-preferences"
import {
  AppearanceRuntimeProvider,
  ThemeToggleHotkey,
} from "@repo/feature-theme"
import type {
  AppearancePreference,
} from "@repo/shared-contracts/types"

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
  const preferencesAdapter = useMemo(() => createCookiePreferencesAdapter(), [])

  return (
    <PreferencesProvider
      adapter={preferencesAdapter}
      {...(initialPreference === undefined ? {} : { initialPreference })}
    >
      <AppearanceBridge>{children}</AppearanceBridge>
    </PreferencesProvider>
  )
}
