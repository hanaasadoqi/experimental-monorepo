import { beforeEach, describe, expect, it, vi } from "vitest"

import { readCookie } from "@repo/shared-utils/server"

import { readAppearancePreferenceCookie } from "./index"

vi.mock("@repo/shared-utils/server", () => ({
  readCookie: vi.fn(),
}))

describe("readAppearancePreferenceCookie", () => {
  beforeEach(() => {
    vi.mocked(readCookie).mockReset()
  })

  it.each(["light", "dark", "system"] as const)(
    "returns the canonical %s cookie value",
    async (preference) => {
      vi.mocked(readCookie).mockResolvedValue(preference)

      await expect(readAppearancePreferenceCookie()).resolves.toBe(preference)
    }
  )

  it("returns undefined for an invalid cookie value", async () => {
    vi.mocked(readCookie).mockResolvedValue("automatic")

    await expect(readAppearancePreferenceCookie()).resolves.toBeUndefined()
  })

  it("returns undefined when the cookie is absent", async () => {
    vi.mocked(readCookie).mockResolvedValue(undefined)

    await expect(readAppearancePreferenceCookie()).resolves.toBeUndefined()
  })
})
