"use client"

import type { ReactNode } from "react"

import { PreferencesProvider } from "@repo/runtime-preferences"
import type { AppearancePreference } from "@repo/domain-preferences"
import {
  ThemeScopeProvider,
  type ThemeScopeProviderProps,
} from "@repo/runtime-theme"

import { AppearanceBridge } from "./appearance-bridge"
import { RootScopeSync } from "./root-scope-sync"

import { PreferencesPersistence } from "../preferences/preferences-persistence"
import { ClientApplicationProvider } from "./client-application-providers"
// import { ThemeToggleHotkey } from "@repo/ui-theme/components"
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
      {/*
        Root scope doesn't specify getStorage because preference is the source of truth.
        The cookie persists the preference; scope state is derived from it via RootScopeSync.
        On reload: cookie → PreferencesProvider → RootScopeSync → ThemeScopeProvider.
      */}
      <ThemeScopeProvider scopeId="root" {...scopeState}>
        <PreferencesProvider
          initialPreferences={
            initialAppearance ? { appearance: initialAppearance } : undefined
          }
        >
          <RootScopeSync />
          <PreferencesPersistence />
          <AppearanceBridge>{children}</AppearanceBridge>
        </PreferencesProvider>
      </ThemeScopeProvider>
    </ClientApplicationProvider>
  )
}
