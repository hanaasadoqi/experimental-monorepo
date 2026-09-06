"use client"

import { useEffect, useRef } from "react"

import {
  useAppearancePreference,
  useLanguagePreference,
} from "@repo/runtime-preferences"
import { syncPreferencesToServer } from "./sync-preferences-to-server"

/**
 * Sync preference changes to server (cookies).
 *
 * Skips initial render to avoid unnecessary API calls on hydration.
 * When preferences change, syncs appearance + language to server cookies.
 * dateFormat + timeFormat stay client-only (localStorage via Zustand).
 */
export function PreferencesPersistence() {
  const appearance = useAppearancePreference()
  const language = useLanguagePreference()
  const isInitialRender = useRef(true)

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }

    void syncPreferencesToServer({
      appearance,
      language,
    }).catch((error: unknown) => {
      console.warn("Failed to sync preferences to server", error)
    })
  }, [appearance, language])

  return null
}
