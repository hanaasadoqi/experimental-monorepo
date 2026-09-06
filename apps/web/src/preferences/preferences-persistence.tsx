"use client"

import { useEffect, useRef } from "react"

import { useAppearancePreference } from "@repo/features-preferences"
import { persistAppearancePreference } from "./persist-appearance-preference"

export function PreferencesPersistence() {
  const appearance = useAppearancePreference()
  const isInitialRender = useRef(true)

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }

    void persistAppearancePreference(appearance).catch((error: unknown) => {
      console.warn("Failed to persist appearance preference", error)
    })
  }, [appearance])

  return null
}
