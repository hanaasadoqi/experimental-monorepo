import { afterEach, describe, expect, it, vi } from "vitest"

import { describeAdapterContract } from "./adapter.contract.test"
import { createCookieAppearanceAdapter } from "./cookie-adapter"

const TEST_COOKIE_NAME = "test-appearance"

function clearCookie(name: string): void {
  document.cookie = `${name}=; Max-Age=0; Path=/`
}

afterEach(() => {
  clearCookie(TEST_COOKIE_NAME)
  clearCookie("appearance-preference")
})

describeAdapterContract(() =>
  createCookieAppearanceAdapter({ name: TEST_COOKIE_NAME })
)

describe("createCookieAppearanceAdapter", () => {
  it("uses 'appearance-preference' as the default cookie name", () => {
    const adapter = createCookieAppearanceAdapter()
    adapter.write("dark")
    expect(document.cookie).toContain("appearance-preference=dark")
  })

  it("uses a custom cookie name when provided", () => {
    const adapter = createCookieAppearanceAdapter({ name: TEST_COOKIE_NAME })
    adapter.write("dark")
    expect(document.cookie).toContain(`${TEST_COOKIE_NAME}=dark`)
  })

  it("reads a value written directly to document.cookie", () => {
    document.cookie = `${TEST_COOKIE_NAME}=light; Path=/`
    const adapter = createCookieAppearanceAdapter({ name: TEST_COOKIE_NAME })
    expect(adapter.read()).toBe("light")
  })

  it("writes a value readable directly from document.cookie", () => {
    const adapter = createCookieAppearanceAdapter({ name: TEST_COOKIE_NAME })
    adapter.write("system")
    expect(document.cookie).toContain(`${TEST_COOKIE_NAME}=system`)
  })

  it("ignores invalid persisted values", () => {
    document.cookie = `${TEST_COOKIE_NAME}=not-a-real-preference; Path=/`
    const adapter = createCookieAppearanceAdapter({ name: TEST_COOKIE_NAME })
    expect(adapter.read()).toBeNull()
  })

  it("handles unavailable document gracefully", () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      "document"
    )

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get() {
        throw new Error("document is unavailable")
      },
    })

    try {
      const adapter = createCookieAppearanceAdapter({
        name: TEST_COOKIE_NAME,
      })
      expect(() => adapter.read()).not.toThrow()
      expect(adapter.read()).toBeNull()
      expect(() => adapter.write("dark")).not.toThrow()
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(globalThis, "document", originalDescriptor)
      }
    }
  })

  describe("cookie attributes", () => {
    it("includes Max-Age using the default (1 year)", () => {
      const adapter = createCookieAppearanceAdapter({
        name: TEST_COOKIE_NAME,
      })
      const setCookieSpy = vi.spyOn(document, "cookie", "set")

      adapter.write("dark")

      expect(setCookieSpy).toHaveBeenCalledWith(
        expect.stringContaining("Max-Age=31536000")
      )
      setCookieSpy.mockRestore()
    })

    it("includes Path and SameSite defaults", () => {
      const adapter = createCookieAppearanceAdapter({
        name: TEST_COOKIE_NAME,
      })
      const setCookieSpy = vi.spyOn(document, "cookie", "set")

      adapter.write("dark")

      const written = setCookieSpy.mock.calls[0]?.[0] ?? ""
      expect(written).toContain("Path=/")
      expect(written).toContain("SameSite=Lax")
      setCookieSpy.mockRestore()
    })

    it("respects custom maxAge, path, and sameSite options", () => {
      const adapter = createCookieAppearanceAdapter({
        name: TEST_COOKIE_NAME,
        maxAge: 60,
        path: "/app",
        sameSite: "Strict",
      })
      const setCookieSpy = vi.spyOn(document, "cookie", "set")

      adapter.write("dark")

      const written = setCookieSpy.mock.calls[0]?.[0] ?? ""
      expect(written).toContain("Max-Age=60")
      expect(written).toContain("Path=/app")
      expect(written).toContain("SameSite=Strict")
      setCookieSpy.mockRestore()
    })

    it("adds Secure when explicitly requested", () => {
      const adapter = createCookieAppearanceAdapter({
        name: TEST_COOKIE_NAME,
        secure: true,
      })
      const setCookieSpy = vi.spyOn(document, "cookie", "set")

      adapter.write("dark")

      const written = setCookieSpy.mock.calls[0]?.[0] ?? ""
      expect(written).toContain("Secure")
      setCookieSpy.mockRestore()
    })

    it("omits Secure when explicitly disabled", () => {
      const adapter = createCookieAppearanceAdapter({
        name: TEST_COOKIE_NAME,
        secure: false,
      })
      const setCookieSpy = vi.spyOn(document, "cookie", "set")

      adapter.write("dark")

      const written = setCookieSpy.mock.calls[0]?.[0] ?? ""
      expect(written).not.toContain("Secure")
      setCookieSpy.mockRestore()
    })
  })

  describe("cross-tab sync via BroadcastChannel", () => {
    it("notifies a listener on another adapter instance sharing the same cookie name", async () => {
      const sender = createCookieAppearanceAdapter({ name: TEST_COOKIE_NAME })
      const receiver = createCookieAppearanceAdapter({
        name: TEST_COOKIE_NAME,
      })
      const listener = vi.fn()
      const unsubscribe = receiver.subscribe(listener)

      sender.write("dark")

      await vi.waitFor(() => {
        expect(listener).toHaveBeenCalledWith("dark")
      })

      unsubscribe()
    })

    it("does not notify listeners on a different cookie name's channel", async () => {
      const sender = createCookieAppearanceAdapter({ name: TEST_COOKIE_NAME })
      const receiver = createCookieAppearanceAdapter({
        name: "a-different-cookie-name",
      })
      const listener = vi.fn()
      const unsubscribe = receiver.subscribe(listener)

      sender.write("dark")
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(listener).not.toHaveBeenCalled()
      unsubscribe()
    })
  })
})
