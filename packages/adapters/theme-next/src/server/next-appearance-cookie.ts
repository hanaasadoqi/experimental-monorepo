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

  if (value === undefined) return undefined

  return appearancePreferenceSchema.safeParse(value).data
}

/**
 * Write appearance preference to response cookies.
 * Server-only function (use in Server Components or API routes).
 *
 * Returns success status and optional error message.
 * Logs errors for debugging.
 *
 * Usage in API route:
 * ```ts
 * export async function POST(request: Request) {
 *   const { preference } = await request.json()
 *   const result = await writeAppearanceCookie(preference)
 *   if (!result.success) {
 *     return Response.json({ ok: false, error: result.error }, { status: 500 })
 *   }
 *   return Response.json({ ok: true })
 * }
 * ```
 */
export async function writeAppearanceCookie(
  preference: AppearancePreference
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await getCookieStore()
    const validatedPreference = appearancePreferenceSchema.parse(preference)

    cookieStore.set(APPEARANCE_COOKIE_NAME, validatedPreference, {
      maxAge: APPEARANCE_COOKIE_MAX_AGE,
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    // Verify cookie was written correctly by reading it back
    const written = cookieStore.get(APPEARANCE_COOKIE_NAME)?.value
    if (written !== validatedPreference) {
      return {
        success: false,
        error: `Cookie write failed verification: expected ${validatedPreference}, got ${written}`,
      }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error(`Failed to write appearance cookie: ${message}`)
    return { success: false, error: message }
  }
}

/**
 * Clear appearance preference cookie.
 */
export async function clearAppearanceCookie(): Promise<void> {
  const cookieStore = await getCookieStore()
  cookieStore.delete(APPEARANCE_COOKIE_NAME)
}
