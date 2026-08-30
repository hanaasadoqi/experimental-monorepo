import type { AppearancePreference } from "@repo/feature-preferences"

import { APPEARANCE_PREFERENCE_COOKIE } from "./cookie-policy"

export function persistAppearancePreference(
  preference: AppearancePreference
): void {
  document.cookie = [
    `${APPEARANCE_PREFERENCE_COOKIE}=${encodeURIComponent(preference)}`,
    "Path=/",
    "SameSite=Lax",
  ].join("; ")
}
