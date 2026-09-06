import { afterEach, describe, expect, it, vi } from "vitest"

import {
  readAppearancePreferenceFromCookie,
  syncAppearancePreferenceToServer,
  verifyCookieSet,
} from "./next-appearance-client"

afterEach(() => vi.unstubAllGlobals())

describe("Next appearance client adapter", () => {
  it("reads and validates the appearance cookie", () => {
    vi.stubGlobal("document", { cookie: "language=en; appearance=dark" })
    expect(readAppearancePreferenceFromCookie()).toBe("dark")
    expect(verifyCookieSet("dark")).toBe(true)

    vi.stubGlobal("document", { cookie: "appearance=sepia" })
    expect(readAppearancePreferenceFromCookie()).toBeUndefined()
  })

  it("posts validated preferences to the server", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal("fetch", fetchMock)
    await syncAppearancePreferenceToServer("light")
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/appearance-preference",
      expect.objectContaining({
        body: JSON.stringify({ preference: "light" }),
        method: "POST",
      })
    )
  })

  it("surfaces unsuccessful persistence responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    )
    await expect(syncAppearancePreferenceToServer("dark")).rejects.toThrow(
      "Failed to persist appearance preference (500)"
    )
  })
})
