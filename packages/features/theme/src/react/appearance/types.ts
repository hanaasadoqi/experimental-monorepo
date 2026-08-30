import type { ReactNode } from "react"
import type { AppearancePreference } from "@repo/feature-preferences"

export interface AppearanceRuntimeProviderProps {
  preference: AppearancePreference
  children: ReactNode
}
