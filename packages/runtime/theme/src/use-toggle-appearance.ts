"use client"

import { AppearancePreference } from "./model";
import { useState } from "react"

import { useResolvedAppearance } from "./use-resolved-appearance"

export function useToggleAppearance(): () => void {
  const resolvedAppearance = useResolvedAppearance()

  const [, setAppearance] = useState<AppearancePreference>(resolvedAppearance)

  const isDark = resolvedAppearance === "dark"

  return () => {
    const newMode: AppearancePreference = isDark ? "light" : "dark"
    setAppearance(newMode)
  }
}
