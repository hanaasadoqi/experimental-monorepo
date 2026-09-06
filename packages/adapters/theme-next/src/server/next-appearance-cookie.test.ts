import { beforeEach, describe, expect, it, vi } from "vitest"

import { APPEARANCE_COOKIE_MAX_AGE } from "../appearance-cookie"
import { getCookieStore } from "./cookies-store"
import {
  clearAppearanceCookie,
  readAppearanceCookie,
  writeAppearanceCookie,
} from "./next-appearance-cookie"

vi.mock("./cookies-store", () => ({ getCookieStore: vi.fn() }))

function createCookieStore(initial?: string) {
  let value = initial
  return {
    delete: vi.fn(() => {
      value = undefined
    }),
    get: vi.fn(() => (value === undefined ? undefined : { value })),
    set: vi.fn((_name: string, next: string) => {
      value = next
    }),
  }
}

describe("Next appearance cookie adapter", () => {
  beforeEach(() => vi.clearAllMocks())

  it("reads valid cookies and rejects invalid values", async () => {
    const valid = createCookieStore("dark")
    vi.mocked(getCookieStore).mockResolvedValue(valid as never)
    await expect(readAppearanceCookie()).resolves.toBe("dark")

    const invalid = createCookieStore("sepia")
    vi.mocked(getCookieStore).mockResolvedValue(invalid as never)
    await expect(readAppearanceCookie()).resolves.toBeUndefined()
  })

  it("writes a validated cookie with the shared policy", async () => {
    const store = createCookieStore()
    vi.mocked(getCookieStore).mockResolvedValue(store as never)

    await expect(writeAppearanceCookie("light")).resolves.toEqual({
      success: true,
    })
    expect(store.set).toHaveBeenCalledWith(
      "appearance",
      "light",
      expect.objectContaining({
        httpOnly: false,
        maxAge: APPEARANCE_COOKIE_MAX_AGE,
        path: "/",
        sameSite: "lax",
      })
    )
  })

  it("reports validation failures without writing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    const store = createCookieStore()
    vi.mocked(getCookieStore).mockResolvedValue(store as never)
    const result = await writeAppearanceCookie("sepia" as never)
    expect(result.success).toBe(false)
    expect(store.set).not.toHaveBeenCalled()
  })

  it("reports when a cookie write cannot be read back", async () => {
    const store = {
      delete: vi.fn(),
      get: vi.fn(() => undefined),
      set: vi.fn(),
    }
    vi.mocked(getCookieStore).mockResolvedValue(store as never)

    await expect(writeAppearanceCookie("dark")).resolves.toEqual({
      success: false,
      error: "Cookie write failed verification: expected dark, got undefined",
    })
  })

  it("clears the appearance cookie", async () => {
    const store = createCookieStore("dark")
    vi.mocked(getCookieStore).mockResolvedValue(store as never)
    await clearAppearanceCookie()
    expect(store.delete).toHaveBeenCalledWith("appearance")
  })
})
