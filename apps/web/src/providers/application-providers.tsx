"use client"

import type { ReactNode } from "react"

import {
  PreferencesProvider,
  type AppearancePreference,
} from "@repo/features-preferences"

import { AppearanceBridge } from "./appearance-bridge"

import { PreferencesPersistence } from "./preferences-persistence"
import { ClientApplicationProvider } from "./client-application-providers"

export interface ApplicationProvidersProps {
  children: ReactNode
  initialAppearance?: AppearancePreference
}

export function ApplicationProviders({
  children,
  initialAppearance,
}: ApplicationProvidersProps) {
  return (
    <ClientApplicationProvider>
      <PreferencesProvider initialAppearance={initialAppearance}>
        <PreferencesPersistence />
        <AppearanceBridge>{children}</AppearanceBridge>
      </PreferencesProvider>
    </ClientApplicationProvider>
  )
}
