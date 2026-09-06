/**
 * Next.js client adapter for appearance preference.
 * Client-side utilities for reading/syncing appearance preference.
 */

import {
  appearancePreferenceSchema,
  type AppearancePreference,
} from "@repo/domain-preferences/appearance"
import { APPEARANCE_COOKIE_NAME } from "../appearance-cookie"

/**
 * Read appearance preference from cookie (client-side).
 * Falls back to localStorage if cookie is unavailable.
 */
export function readAppearancePreferenceFromCookie():
  AppearancePreference | undefined {
  if (typeof document === "undefined") return undefined

  // Try to read from cookies string (document.cookie)
  const cookies = document.cookie.split("; ")
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=")
    if (name === APPEARANCE_COOKIE_NAME) {
      return appearancePreferenceSchema.safeParse(value).data
    }
  }

  return undefined
}

/**
 * Write appearance preference via server action or API call.
 * Triggers cookie update on the server.
 */
export async function syncAppearancePreferenceToServer(
  preference: AppearancePreference
): Promise<void> {
  const validatedPreference = appearancePreferenceSchema.parse(preference)
  const response = await fetch("/api/appearance-preference", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preference: validatedPreference }),
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(
      `Failed to persist appearance preference (${response.status})`
    )
  }
}

/**
 * Verify cookie is set correctly by reading it back.
 * Useful for debugging SSR/hydration mismatches.
 */
export function verifyCookieSet(preference: AppearancePreference): boolean {
  return readAppearancePreferenceFromCookie() === preference
}
