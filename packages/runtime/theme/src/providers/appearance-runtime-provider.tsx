"use client"

import { useEffect, type ReactNode } from "react"

import type { AppearancePreference } from "@repo/features-preferences"

import { AppearanceContext } from "./appearance-context"

import { useSystemAppearance } from "./use-system-appearance"
import { resolveAppearance } from "../resolution"
import { applyAppearance } from "../runtime"

export interface AppearanceRuntimeProviderProps {
  preference: AppearancePreference
  children: ReactNode
}

export function AppearanceRuntimeProvider({
  preference,
  children,
}: AppearanceRuntimeProviderProps) {
  const systemAppearance = useSystemAppearance()

  const resolvedAppearance = resolveAppearance(preference, systemAppearance)

  useEffect(() => {
    applyAppearance(resolvedAppearance)
  }, [resolvedAppearance])

  return (
    <AppearanceContext value={resolvedAppearance}>{children}</AppearanceContext>
  )
}
