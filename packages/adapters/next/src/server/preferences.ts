/**
 * Read and write preference cookies via Next.js API.
 * Server-only functions.
 *
 * Only appearance and language are persisted via cookies.
 * These provide SSR-critical state hydration.
 */
import { readCookie, setCookie, deleteCookie } from "@repo/services-cookies"
import {
  type AppearancePreference,
  type LanguagePreference,
} from "@repo/domain-preferences"
import { getCookieStore, adaptCookieStore } from "./cookies-store"
import { appearanceCookie, languageCookie } from "./preferences-cookies"

export interface PreferencesFromCookie {
  appearance?: AppearancePreference
  language?: LanguagePreference
}

export interface WritePreferencesCookieOptions {
  appearance?: AppearancePreference
  language?: LanguagePreference
}

/**
 * Read appearance and language preferences from request cookies.
 * Returns an object with optional fields.
 * Missing cookies are omitted from the result.
 */
export async function readPreferencesCookie(): Promise<PreferencesFromCookie> {
  const nextCookieStore = await getCookieStore()
  const cookieStore = adaptCookieStore(nextCookieStore)

  const result: PreferencesFromCookie = {}

  const appearanceResult = readCookie(cookieStore, appearanceCookie)
  if (appearanceResult.value !== null) {
    result.appearance = appearanceResult.value
  }

  const languageResult = readCookie(cookieStore, languageCookie)
  if (languageResult.value !== null) {
    result.language = languageResult.value
  }

  return result
}

/**
 * Write appearance and/or language preferences to response cookies.
 * Only writes fields that are provided; omitted fields are unchanged.
 */
export async function writePreferencesCookie(
  options: WritePreferencesCookieOptions
): Promise<{ success: boolean; error?: string }> {
  try {
    const nextCookieStore = await getCookieStore()
    const cookieStore = adaptCookieStore(nextCookieStore)

    if (options.appearance !== undefined) {
      setCookie(cookieStore, appearanceCookie, options.appearance)
    }

    if (options.language !== undefined) {
      setCookie(cookieStore, languageCookie, options.language)
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error(`Failed to write preferences cookie: ${message}`)
    return { success: false, error: message }
  }
}

/**
 * Clear individual preference cookies.
 */
export async function clearAppearanceCookie(): Promise<void> {
  const nextCookieStore = await getCookieStore()
  const cookieStore = adaptCookieStore(nextCookieStore)
  deleteCookie(cookieStore, appearanceCookie)
}

export async function clearLanguageCookie(): Promise<void> {
  const nextCookieStore = await getCookieStore()
  const cookieStore = adaptCookieStore(nextCookieStore)
  deleteCookie(cookieStore, languageCookie)
}

/**
 * Clear all preference cookies (appearance and language).
 */
export async function clearAllPreferencesCookies(): Promise<void> {
  const nextCookieStore = await getCookieStore()
  const cookieStore = adaptCookieStore(nextCookieStore)
  deleteCookie(cookieStore, appearanceCookie)
  deleteCookie(cookieStore, languageCookie)
}
