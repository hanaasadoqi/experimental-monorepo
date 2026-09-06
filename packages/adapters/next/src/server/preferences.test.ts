import { beforeEach, describe, expect, it, vi } from "vitest"

import { getCookieStore } from "./cookies-store"
import {
  clearAllPreferencesCookies,
  readPreferencesCookie,
  writePreferencesCookie,
} from "./preferences"

vi.mock("./cookies-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./cookies-store")>()
  return { ...actual, getCookieStore: vi.fn() }
})

function createCookieStore(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  return {
    delete: vi.fn((name: string) => values.delete(name)),
    get: vi.fn((name: string) => {
      const value = values.get(name)
      return value === undefined ? undefined : { value }
    }),
    set: vi.fn((name: string, value: string) => values.set(name, value)),
  }
}

describe("Next preferences adapter", () => {
  beforeEach(() => vi.clearAllMocks())

  it("reads valid SSR preferences and ignores invalid values", async () => {
    const store = createCookieStore({ appearance: "dark", language: "invalid" })
    vi.mocked(getCookieStore).mockResolvedValue(store as never)
    await expect(readPreferencesCookie()).resolves.toEqual({
      appearance: "dark",
    })
  })

  it("writes only the provided preferences", async () => {
    const store = createCookieStore()
    vi.mocked(getCookieStore).mockResolvedValue(store as never)
    await expect(
      writePreferencesCookie({ appearance: "light" })
    ).resolves.toEqual({ success: true })
    expect(store.set).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledWith(
      "appearance",
      "light",
      expect.objectContaining({ path: "/", sameSite: "lax" })
    )
  })

  it("returns a failure result when the cookie store rejects a write", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    const store = createCookieStore()
    store.set.mockImplementation(() => {
      throw new Error("read-only response")
    })
    vi.mocked(getCookieStore).mockResolvedValue(store as never)
    await expect(
      writePreferencesCookie({ appearance: "dark" })
    ).resolves.toEqual({ success: false, error: "read-only response" })
  })

  it("clears all SSR preference cookies", async () => {
    const store = createCookieStore({ appearance: "dark", language: "en" })
    vi.mocked(getCookieStore).mockResolvedValue(store as never)
    await clearAllPreferencesCookies()
    expect(store.delete).toHaveBeenCalledWith("appearance")
    expect(store.delete).toHaveBeenCalledWith("language")
  })
})
