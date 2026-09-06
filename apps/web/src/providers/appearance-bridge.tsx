"use client"

import { type ReactNode } from "react"

import {
  useAppearancePreference,
  useSetAppearancePreference,
} from "@repo/runtime-preferences"

import { ThemeToggleHotkey } from "@repo/ui-theme"
import { resolveAppearance } from "@repo/runtime-theme"
import {
  useSystemAppearance,
  applyAppearanceToDocument,
} from "@repo/adapters-theme-browser"
import type { ResolvedAppearancePreference } from "@repo/domain-preferences"
import { useEffect } from "react"

function RootAppearanceSync({
  appearance,
}: {
  appearance: ResolvedAppearancePreference
}) {
  useEffect(() => {
    applyAppearanceToDocument(appearance)
  }, [appearance])

  return null
}

export interface AppearanceBridgeProps {
  children: ReactNode
}

export function AppearanceBridge({ children }: AppearanceBridgeProps) {
  const preference = useAppearancePreference()
  const systemAppearance = useSystemAppearance()
  const resolvedPreference = resolveAppearance(preference, systemAppearance)
  const setPreference = useSetAppearancePreference()

  const handleAppearanceChange = (next: ResolvedAppearancePreference) => {
    setPreference(next)
  }

  return (
    <>
      <RootAppearanceSync appearance={resolvedPreference} />
      <ThemeToggleHotkey
        resolvedAppearance={resolvedPreference}
        onAppearanceChange={handleAppearanceChange}
      />
      {children}
    </>
  )
}
