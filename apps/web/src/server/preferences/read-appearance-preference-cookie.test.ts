import { beforeEach, describe, expect, it, vi } from "vitest"

import { readAppearancePreferenceCookie } from "./read-appearance-preference-cookie"
import * as cookieStore from "@repo/adapters-theme-next/server/cookies-store"

vi.mock("@repo/adapters-theme-next/server/cookies-store")

describe("readAppearancePreferenceCookie", () => {
  const mockGetCookieStore = vi.mocked(cookieStore.getCookieStore)

  beforeEach(() => {
    mockGetCookieStore.mockReset()
  })

  it.each(["light", "dark", "system"] as const)(
    "returns the canonical %s cookie value",
    async (preference) => {
      mockGetCookieStore.mockResolvedValue({
        get: (name: string) =>
          name === "appearance" ? { name, value: preference } : undefined,
      } as unknown as Awaited<ReturnType<typeof cookieStore.getCookieStore>>)

      await expect(readAppearancePreferenceCookie()).resolves.toBe(preference)
    }
  )

  it.each(["automatic", undefined])(
    "returns undefined for %s",
    async (value) => {
      mockGetCookieStore.mockResolvedValue({
        get: (name: string) =>
          name === "appearance" && value !== undefined
            ? { name, value }
            : undefined,
      } as unknown as Awaited<ReturnType<typeof cookieStore.getCookieStore>>)

      await expect(readAppearancePreferenceCookie()).resolves.toBeUndefined()
    }
  )
})
