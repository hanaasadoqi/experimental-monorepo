import type { cookies } from "next/headers"

export type NextCookieStore = Awaited<ReturnType<typeof cookies>>

/**
 * Get the Next.js cookie store for the current request.
 * This is extracted to a separate module to enable mocking in tests.
 * Server-only function.
 */
export async function getCookieStore(): Promise<NextCookieStore> {
  const { cookies } = await import("next/headers")
  return await cookies()
}
