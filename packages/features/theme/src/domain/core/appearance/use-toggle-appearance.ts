"use client"

import { useSetAppearancePreference } from "@repo/features-preferences"

import { useResolvedAppearance } from "./use-resolved-appearance"


export function useToggleAppearance(): () => void {
  const resolvedAppearance = useResolvedAppearance()

  const setAppearance = useSetAppearancePreference()

  return () => {
    setAppearance(resolvedAppearance === "dark" ? "light" : "dark")
  }
}
