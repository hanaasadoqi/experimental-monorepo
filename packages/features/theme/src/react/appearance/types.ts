import type { ReactNode } from "react"
import type { AppearancePreference } from "@repo/features-preferences"

export interface AppearanceRuntimeProviderProps {
  preference: AppearancePreference
  children: ReactNode
}
