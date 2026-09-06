import type { cookies } from "next/headers"
import type { CookieWriter } from "@repo/services-cookies"

export type NextCookieStore = Awaited<ReturnType<typeof cookies>>

/**
 * Get the Next.js cookie store for the current request.
 * Extracted to a separate module to enable mocking in tests.
 * Server-only function.
 */
export async function getCookieStore(): Promise<NextCookieStore> {
  const { cookies } = await import("next/headers")
  return await cookies()
}

/**
 * Adapt Next.js cookie store to CookieWriter interface.
 * Handles the API differences between Next.js and services-cookies.
 */
export function adaptCookieStore(
  nextCookieStore: NextCookieStore
): CookieWriter {
  return {
    get(name: string): string | undefined {
      return nextCookieStore.get(name)?.value
    },

    set(name: string, value: string, options?: Record<string, unknown>): void {
      nextCookieStore.set(name, value, options)
    },

    delete(name: string, _options?: { path?: string; domain?: string }): void {
      nextCookieStore.delete(name)
    },
  }
}
