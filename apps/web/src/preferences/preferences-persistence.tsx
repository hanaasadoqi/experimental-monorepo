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
 * On first render (initial), writes initial preference cookies.
 * On subsequent changes, syncs appearance + language to server cookies.
 * dateFormat + timeFormat stay client-only (localStorage via Zustand).
 */
export function PreferencesPersistence() {
  const appearance = useAppearancePreference()
  const language = useLanguagePreference()
  const isInitialRender = useRef(true)

  useEffect(() => {
    if (isInitialRender.current) {
      // On first render, write initial cookies to ensure they exist
      isInitialRender.current = false
      void syncPreferencesToServer({
        appearance,
        language,
      }).catch((error: unknown) => {
        console.warn("Failed to create initial preference cookies", error)
      })
      return
    }

    // On subsequent changes, sync to server
    void syncPreferencesToServer({
      appearance,
      language,
    }).catch((error: unknown) => {
      console.warn("Failed to sync preferences to server", error)
    })
  }, [appearance, language])

  return null
}
