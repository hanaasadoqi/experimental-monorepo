import type { AppearancePreference } from "@repo/features-preferences"

import { serializeCookie } from "@repo/services-cookies"

import { appearanceCookie } from "./cookie-policy"

export function persistAppearancePreference(
  preference: AppearancePreference
): void {
  document.cookie = serializeCookie(appearanceCookie, preference)
}
