"use client"

import { useEffect } from "react"

import { applyAppearance } from "@repo/runtime-theme"
import type { ThemeMode } from "@repo/domain-theme/appearance"

export interface RootAppearanceSyncProps {
  appearance: ThemeMode
}

export function RootAppearanceSync({ appearance }: RootAppearanceSyncProps) {
  useEffect(() => {
    applyAppearance(appearance)
  }, [appearance])

  return null
}
