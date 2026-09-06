/**
 * Next.js server adapter for appearance preference cookie.
 * Handles reading/writing appearance preference from Next.js cookies API.
 */
import { getCookieStore } from "./cookies-store"
import {
  appearancePreferenceSchema,
  type AppearancePreference,
} from "@repo/domain-preferences/appearance"
import {
  APPEARANCE_COOKIE_MAX_AGE,
  APPEARANCE_COOKIE_NAME,
} from "../appearance-cookie"

/**
 * Read appearance preference from request cookies.
 * Server-only function (use in Server Components or API routes).
 */
export async function readAppearanceCookie(): Promise<
  AppearancePreference | undefined
> {
  const cookieStore = await getCookieStore()
  const value = cookieStore.get(APPEARANCE_COOKIE_NAME)?.value

  return appearancePreferenceSchema.safeParse(value).data
}

/**
 * Write appearance preference to response cookies.
 * Server-only function (use in Server Components or API routes).
 *
 * Usage in API route:
 * ```ts
 * export async function POST(request: Request) {
 *   const { preference } = await request.json()
 *   await writeAppearanceCookie(preference)
 *   return Response.json({ ok: true })
 * }
 * ```
 */
export async function writeAppearanceCookie(
  preference: AppearancePreference
): Promise<void> {
  const cookieStore = await getCookieStore()
  const validatedPreference = appearancePreferenceSchema.parse(preference)

  cookieStore.set(APPEARANCE_COOKIE_NAME, validatedPreference, {
    maxAge: APPEARANCE_COOKIE_MAX_AGE,
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

/**
 * Clear appearance preference cookie.
 */
export async function clearAppearanceCookie(): Promise<void> {
  const cookieStore = await getCookieStore()
  cookieStore.delete(APPEARANCE_COOKIE_NAME)
}
