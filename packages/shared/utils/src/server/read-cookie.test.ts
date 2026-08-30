/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { readCookie } from "./read-cookie"

// Mock Next.js cookies function
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

import { cookies } from "next/headers"

describe("readCookie", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns cookie value when it exists", async () => {
    const mockCookieStore = {
      get: vi.fn((name: string) => {
        if (name === "test-cookie") {
          return { value: "test-value" }
        }
        return undefined
      }),
    }
      ; (cookies as any).mockResolvedValue(mockCookieStore)

    const result = await readCookie("test-cookie")
    expect(result).toBe("test-value")
  })

  it("returns undefined when cookie does not exist", async () => {
    const mockCookieStore = {
      get: vi.fn(() => undefined),
    }
    ;(cookies as any).mockResolvedValue(mockCookieStore)

    const result = await readCookie("non-existent")
    expect(result).toBeUndefined()
  })

  it("returns undefined when cookie value is null", async () => {
    const mockCookieStore = {
      get: vi.fn(() => null),
    }
    ;(cookies as any).mockResolvedValue(mockCookieStore)

    const result = await readCookie("null-cookie")
    expect(result).toBeUndefined()
  })

  it("calls cookies() from next/headers", async () => {
    const mockCookieStore = {
      get: vi.fn(() => ({ value: "test" })),
    }
    ;(cookies as any).mockResolvedValue(mockCookieStore)

    await readCookie("any-cookie")
    expect(cookies).toHaveBeenCalled()
  })

  it("calls get() with correct cookie name", async () => {
    const mockCookieStore = {
      get: vi.fn(() => ({ value: "test" })),
    }
    ;(cookies as any).mockResolvedValue(mockCookieStore)

    await readCookie("my-cookie")
    expect(mockCookieStore.get).toHaveBeenCalledWith("my-cookie")
  })

  it("handles empty string cookie name", async () => {
    const mockCookieStore = {
      get: vi.fn(() => ({ value: "value" })),
    }
    ;(cookies as any).mockResolvedValue(mockCookieStore)

    const result = await readCookie("")
    expect(result).toBe("value")
  })

  it("handles cookie value with special characters", async () => {
    const specialValue = "value=with;special:chars"
    const mockCookieStore = {
      get: vi.fn(() => ({ value: specialValue })),
    }
    ;(cookies as any).mockResolvedValue(mockCookieStore)

    const result = await readCookie("special")
    expect(result).toBe(specialValue)
  })

  it("is an async function", () => {
    expect(readCookie.constructor.name).toBe("AsyncFunction")
  })
})
