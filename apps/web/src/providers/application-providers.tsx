"use client"

import type {
  ReactNode,
} from "react"

import {
  PreferencesProvider,
  type AppearancePreference,
} from "@repo/feature-preferences"

import {
  AppearanceBridge,
} from "./appearance-bridge"

import {
  PreferencesPersistence,
} from "./preferences-persistence"

export interface ApplicationProvidersProps {
  children: ReactNode
  initialAppearance?: AppearancePreference
}

export function ApplicationProviders({
  children,
  initialAppearance,
}: ApplicationProvidersProps) {
  return (
    <PreferencesProvider
      initialAppearance={
        initialAppearance
      }
    >
      <PreferencesPersistence />

      <AppearanceBridge>
        {children}
      </AppearanceBridge>
    </PreferencesProvider>
  )
}
