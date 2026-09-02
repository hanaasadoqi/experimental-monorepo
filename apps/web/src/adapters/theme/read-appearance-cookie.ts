import { cookies } from "next/headers"
import type { AppearancePreference } from "@repo/features-preferences"

export async function readAppearanceCookie(): Promise<AppearancePreference | null> {
  const store = await cookies()
  const value = store.get("appearance")?.value
  
  if (!value) return null
  
  try {
    return JSON.parse(value) as AppearancePreference
  } catch {
    return null
  }
}
