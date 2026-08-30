import { cookies } from "next/headers"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { readAppearancePreferenceCookie } from "./read-appearance-preference-cookie"

vi.mock("next/headers", () => ({ cookies: vi.fn() }))

describe("readAppearancePreferenceCookie", () => {
  beforeEach(() => {
    vi.mocked(cookies).mockReset()
  })

  it.each(["light", "dark", "system"] as const)(
    "returns the canonical %s cookie value",
    async (preference) => {
      vi.mocked(cookies).mockResolvedValue({
        get: () => ({ name: "appearance-preference", value: preference }),
      } as Awaited<ReturnType<typeof cookies>>)

      await expect(readAppearancePreferenceCookie()).resolves.toBe(preference)
    }
  )

  it.each(["automatic", undefined])(
    "returns undefined for %s",
    async (value) => {
      vi.mocked(cookies).mockResolvedValue({
        get: () =>
          value === undefined
            ? undefined
            : { name: "appearance-preference", value },
      } as Awaited<ReturnType<typeof cookies>>)

      await expect(readAppearancePreferenceCookie()).resolves.toBeUndefined()
    }
  )
})
