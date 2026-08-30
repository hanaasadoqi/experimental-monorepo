"use client"

import { useEffect } from "react"

import { useAppearancePreference } from "@repo/feature-preferences"

import { persistAppearancePreference } from "../preferences/persist-appearance-preference"

export function PreferencesPersistence() {
  const appearance = useAppearancePreference()

  useEffect(() => {
    persistAppearancePreference(appearance)
  }, [appearance])

  return null
}
