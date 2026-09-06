"use client"

import type { ReactNode } from "react"

import {
  PreferencesProvider,
  type AppearancePreference,
} from "@repo/features-preferences"
import { ThemeScopeProvider, type ThemeScopeProviderProps } from "@repo/runtime-theme"

import { AppearanceBridge } from "./appearance-bridge"
import { RootScopeSync } from "./root-scope-sync"

import { PreferencesPersistence } from "../preferences/preferences-persistence"
import { ClientApplicationProvider } from "./client-application-providers"

export interface ApplicationProvidersProps {
  children: ReactNode
  initialAppearance?: AppearancePreference
}

function appearanceToScopeState(
  preference?: AppearancePreference
): Pick<ThemeScopeProviderProps, "darkModeEnabled"> {
  if (preference === "dark") return { darkModeEnabled: true }
  if (preference === "light") return { darkModeEnabled: false }
  return { darkModeEnabled: undefined }
}

export function ApplicationProviders({
  children,
  initialAppearance,
}: ApplicationProvidersProps) {
  const scopeState = appearanceToScopeState(initialAppearance)

  return (
    <ClientApplicationProvider>
      <ThemeScopeProvider scopeId="root" {...scopeState}>
        <PreferencesProvider initialAppearance={initialAppearance}>
          <RootScopeSync />
          <PreferencesPersistence />
          <AppearanceBridge>{children}</AppearanceBridge>
        </PreferencesProvider>
      </ThemeScopeProvider>
    </ClientApplicationProvider>
  )
}
