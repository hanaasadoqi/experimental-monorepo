import type { AppearancePreference } from "@repo/features-preferences"
import { syncAppearancePreferenceToServer } from "@repo/adapters-theme-next/client"

export async function persistAppearancePreference(
  preference: AppearancePreference
): Promise<void> {
  await syncAppearancePreferenceToServer(preference)
}
