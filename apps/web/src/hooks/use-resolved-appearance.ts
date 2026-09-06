"use client"

import { useEffect, useState } from "react"
import { useAppearancePreference } from "@repo/runtime-preferences"
import { resolveAppearance } from "@repo/runtime-theme"
import type { ResolvedAppearancePreference } from "@repo/domain-preferences"

function useSystemAppearance(): ResolvedAppearancePreference {
  const [system, setSystem] = useState<ResolvedAppearancePreference>(() => {
    if (typeof window === "undefined") return "light"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e: MediaQueryListEvent) =>
      setSystem(e.matches ? "dark" : "light")
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return system
}

/**
 * The appearance actually being rendered: the stored preference with "system"
 * collapsed against the live OS setting.
 *
 * Composed here in the app so that we can depend on both @repo/features-preferences
 * and system detection. Re-renders when the OS setting changes, and is SSR-safe
 * (serves "light" on the server before hydration).
 */
export function useResolvedAppearance(): ResolvedAppearancePreference {
  const preference = useAppearancePreference()
  const systemAppearance = useSystemAppearance()

  return resolveAppearance(preference, systemAppearance)
}
