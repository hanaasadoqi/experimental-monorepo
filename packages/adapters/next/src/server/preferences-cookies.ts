/**
 * Preference cookie definitions using services-cookies infrastructure.
 * These are adapter-level definitions (Next.js specific).
 *
 * Note: Only appearance and language are persisted via cookies.
 * These are the critical preferences for SSR correctness.
 * dateFormat and timeFormat are client-only and don't need server hydration.
 */
import { defineCookie, enumCookieCodec } from "@repo/services-cookies"
import {
  APPEARANCE_OPTIONS,
  LANGUAGE_PREFERENCE_OPTIONS,
  type AppearancePreference,
  type LanguagePreference,
} from "@repo/domain-preferences"

/**
 * Cookie max age: 1 year (accounting for leap year average).
 * Using 365.25 days to account for leap years over multi-year spans.
 */
const PREFERENCES_COOKIE_MAX_AGE = Math.round(60 * 60 * 24 * 365.25)

export const appearanceCookie = defineCookie<AppearancePreference>({
  name: "appearance",
  codec: enumCookieCodec(APPEARANCE_OPTIONS),
  options: {
    maxAge: PREFERENCES_COOKIE_MAX_AGE,
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
})

export const languageCookie = defineCookie<LanguagePreference>({
  name: "language",
  codec: enumCookieCodec(LANGUAGE_PREFERENCE_OPTIONS),
  options: {
    maxAge: PREFERENCES_COOKIE_MAX_AGE,
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
})
