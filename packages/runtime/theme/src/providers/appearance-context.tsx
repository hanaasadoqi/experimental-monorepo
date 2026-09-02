"use client"

import { createContext, useContext } from "react"

import type { ResolvedAppearance } from "../theme.schema.js"

export const AppearanceContext = createContext<ResolvedAppearance | null>(null)

AppearanceContext.displayName = "AppearanceContext"

export function useAppearanceContext(): ResolvedAppearance {
  const appearance = useContext(AppearanceContext)

  if (appearance === null) {
    throw new Error(
      "AppearanceContext is unavailable. " +
        "Ensure this component is rendered " +
        "within AppearanceRuntimeProvider."
    )
  }

  return appearance
}
