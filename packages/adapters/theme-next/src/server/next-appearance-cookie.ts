/**
 * Next.js server adapter for appearance preference cookie.
 * Handles reading/writing appearance preference from Next.js cookies API.
 */

type AppearancePreference = "light" | "dark" | "system"

const APPEARANCE_COOKIE_NAME = "appearance-preference"
const APPEARANCE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

/**
 * Read appearance preference from request cookies.
 * Server-only function (use in Server Components or API routes).
 */
export async function readAppearanceCookie(): Promise<
  AppearancePreference | undefined
> {
  try {
    // This will only work in Server Components or API routes
    // Client-side usage will throw
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const value = cookieStore.get(APPEARANCE_COOKIE_NAME)?.value

    if (!value) return undefined

    // Validate the value is a known preference
    if (value === "light" || value === "dark" || value === "system") {
      return value as AppearancePreference
    }

    return undefined
  } catch (error) {
    // Not in a server context
    return undefined
  }
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
  try {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()

    cookieStore.set(APPEARANCE_COOKIE_NAME, preference, {
      maxAge: APPEARANCE_COOKIE_MAX_AGE,
      path: "/",
      httpOnly: false, // Allow client-side access for hydration
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  } catch (error) {
    // Not in a server context
    console.warn("Failed to write appearance cookie (not in server context):", error)
  }
}

/**
 * Clear appearance preference cookie.
 */
export async function clearAppearanceCookie(): Promise<void> {
  try {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    cookieStore.delete(APPEARANCE_COOKIE_NAME)
  } catch (error) {
    // Not in a server context
  }
}
