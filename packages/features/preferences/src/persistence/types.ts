import type { AppearancePreference } from "@repo/shared-contracts"

export interface PreferencesPersistenceAdapter {
  read(): AppearancePreference | null
  write(preference: AppearancePreference): void
  subscribe(listener: (preference: AppearancePreference) => void): () => void
}

export interface CookiePreferencesAdapterOptions {
  name?: string
  maxAge?: number
  path?: string
  sameSite?: "Strict" | "Lax" | "None"
  secure?: boolean
}
