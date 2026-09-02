"use client"

import { useSyncExternalStore } from "react"
import type { ResolvedAppearance } from "../theme.types"

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"

function getSystemAppearance(): ResolvedAppearance {
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light"
}

function getServerAppearance(): ResolvedAppearance {
  return "light"
}

function subscribe(callback: () => void): () => void {
  const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY)

  mediaQuery.addEventListener("change", callback)

  return () => {
    mediaQuery.removeEventListener("change", callback)
  }
}

export function useSystemAppearance(): ResolvedAppearance {
  return useSyncExternalStore(
    subscribe,
    getSystemAppearance,
    getServerAppearance
  )
}
