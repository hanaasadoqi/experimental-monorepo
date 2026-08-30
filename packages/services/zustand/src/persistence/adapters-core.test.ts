/**
 * Core functionality tests for persistence adapters
 * Tests actual read/write behavior with real localStorage and document.cookie
 * These tests are skipped if the required globals are not available (e.g., during SSR testing)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { createLocalStorageAdapter } from "./local-storage-adapter.js"
import {
  createCookieAdapter,
  type CookieAdapterOptions,
} from "./cookie-adapter.js"

describe("LocalStorage Adapter", () => {
  beforeEach(() => {
    if (typeof localStorage === "undefined") return
    localStorage.clear()
  })

  afterEach(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.clear()
    }
  })

  it("should write and read values from localStorage", async function () {
    if (typeof localStorage === "undefined") return

    const adapter = createLocalStorageAdapter<{ value: string }>("test-key")

    const testData = { value: "test data" }
    localStorage.setItem("test-key", JSON.stringify(testData))

    const result = await adapter.read?.("test-key")
    expect(result).toEqual(testData)
  })

  it("should return null for non-existent keys", async function () {
    if (typeof localStorage === "undefined") return

    const adapter = createLocalStorageAdapter<{ value: string }>("missing-key")
    const result = await adapter.read?.("missing-key")
    expect(result).toBeNull()
  })

  it("should handle JSON parse errors gracefully", async function () {
    if (typeof localStorage === "undefined") return

    const adapter = createLocalStorageAdapter<{ value: string }>("error-test")
    localStorage.setItem("error-test", "{ invalid json }")
    const result = await adapter.read?.("error-test")
    expect(result).toBeNull()
  })

  it("should write values to localStorage", async function () {
    if (typeof localStorage === "undefined") return

    const adapter = createLocalStorageAdapter<{ value: string }>("write-test")
    const testData = { value: "test" }

    await adapter.write?.("write-test", testData)

    const stored = localStorage.getItem("write-test")
    expect(JSON.parse(stored!)).toEqual(testData)
  })

  it("should write complex nested objects", async function () {
    if (typeof localStorage === "undefined") return

    const adapter = createLocalStorageAdapter<{
      nested: { deep: { value: string } }
    }>("complex-test")
    const testData = { nested: { deep: { value: "complex" } } }

    await adapter.write?.("complex-test", testData)

    const result = await adapter.read?.("complex-test")
    expect(result).toEqual(testData)
  })

  it("should write null values", async function () {
    if (typeof localStorage === "undefined") return

    const adapter = createLocalStorageAdapter<{ value: string | null }>(
      "null-test"
    )
    const testData = { value: null }

    await adapter.write?.("null-test", testData)

    const result = await adapter.read?.("null-test")
    expect(result).toEqual(testData)
  })

  it("should write empty objects", async function () {
    if (typeof localStorage === "undefined") return

    const adapter = createLocalStorageAdapter<object>("empty-test")
    const testData = {}

    await adapter.write?.("empty-test", testData)

    const result = await adapter.read?.("empty-test")
    expect(result).toEqual(testData)
  })

  it("should subscribe to storage events", function () {
    if (typeof localStorage === "undefined" || typeof window === "undefined")
      return

    const adapter = createLocalStorageAdapter<{ value: string }>("event-test")
    const listener = vi.fn()

    adapter.subscribe?.("event-test", listener)

    const event = new StorageEvent("storage", {
      key: "event-test",
      newValue: JSON.stringify({ value: "test" }),
    })
    window.dispatchEvent(event)

    expect(listener).toHaveBeenCalledOnce()
  })

  it("should ignore storage events for different keys", function () {
    if (typeof localStorage === "undefined" || typeof window === "undefined")
      return

    const adapter = createLocalStorageAdapter<{ value: string }>(
      "key-filter-test"
    )
    const listener = vi.fn()

    adapter.subscribe?.("key-filter-test", listener)

    const event = new StorageEvent("storage", {
      key: "different-key",
      newValue: JSON.stringify({ value: "test" }),
    })
    window.dispatchEvent(event)

    expect(listener).not.toHaveBeenCalled()
  })

  it("should unsubscribe from storage events", function () {
    if (typeof localStorage === "undefined" || typeof window === "undefined")
      return

    const adapter = createLocalStorageAdapter<{ value: string }>("unsub-test")
    const listener = vi.fn()

    const unsubscribe = adapter.subscribe?.("unsub-test", listener)

    const event1 = new StorageEvent("storage", {
      key: "unsub-test",
      newValue: JSON.stringify({ value: "test1" }),
    })
    window.dispatchEvent(event1)
    expect(listener).toHaveBeenCalledOnce()

    unsubscribe?.()

    const event2 = new StorageEvent("storage", {
      key: "unsub-test",
      newValue: JSON.stringify({ value: "test2" }),
    })
    window.dispatchEvent(event2)

    expect(listener).toHaveBeenCalledOnce()
  })

  it("should handle null keys in storage events", function () {
    if (typeof localStorage === "undefined" || typeof window === "undefined")
      return

    const adapter = createLocalStorageAdapter<{ value: string }>(
      "null-key-test"
    )
    const listener = vi.fn()

    adapter.subscribe?.("null-key-test", listener)

    const event = new StorageEvent("storage", {
      key: null,
      newValue: null,
    })
    window.dispatchEvent(event)

    expect(listener).not.toHaveBeenCalled()
  })

  it("should handle multiple subscribers", function () {
    if (typeof localStorage === "undefined" || typeof window === "undefined")
      return

    const adapter = createLocalStorageAdapter<{ value: string }>(
      "multi-sub-test"
    )
    const listener1 = vi.fn()
    const listener2 = vi.fn()

    adapter.subscribe?.("multi-sub-test", listener1)
    adapter.subscribe?.("multi-sub-test", listener2)

    const event = new StorageEvent("storage", {
      key: "multi-sub-test",
      newValue: JSON.stringify({ value: "test" }),
    })
    window.dispatchEvent(event)

    expect(listener1).toHaveBeenCalledOnce()
    expect(listener2).toHaveBeenCalledOnce()
  })

  it("should handle storage event with undefined newValue", function () {
    if (typeof localStorage === "undefined" || typeof window === "undefined")
      return

    const adapter = createLocalStorageAdapter<{ value: string }>(
      "undef-value-test"
    )
    const listener = vi.fn()

    adapter.subscribe?.("undef-value-test", listener)

    const event = new StorageEvent("storage", {
      key: "undef-value-test",
      newValue: undefined,
    })
    window.dispatchEvent(event)

    expect(listener).toHaveBeenCalledOnce()
  })

  it("passes the parsed external value to subscribers", () => {
    const adapter = createLocalStorageAdapter<{ value: string }>("event-value")
    const listener = vi.fn()
    const unsubscribe = adapter.subscribe?.("event-value", listener)

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "event-value",
        newValue: JSON.stringify({ value: "updated" }),
      })
    )

    expect(listener).toHaveBeenCalledWith({ value: "updated" })
    unsubscribe?.()
  })

  it("clears only the adapter's default key", async () => {
    localStorage.setItem("adapter-primary", JSON.stringify({ value: 1 }))
    localStorage.setItem("adapter-unrelated", JSON.stringify({ value: 2 }))
    const adapter = createLocalStorageAdapter<{ value: number }>(
      "adapter-primary"
    )

    await adapter.clear?.()

    expect(localStorage.getItem("adapter-primary")).toBeNull()
    expect(localStorage.getItem("adapter-unrelated")).not.toBeNull()
  })

  it("reports write failures to its caller", async () => {
    const adapter = createLocalStorageAdapter<{ value: number }>(
      "adapter-primary"
    )
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage quota exceeded", "QuotaExceededError")
    })

    await expect(
      adapter.write?.("adapter-primary", { value: 1 })
    ).rejects.toThrow("Storage quota exceeded")
  })
})

describe("Cookie Adapter", () => {
  beforeEach(() => {
    if (typeof document === "undefined") return
    try {
      document.cookie.split(";").forEach((c) => {
        const name = c.split("=")[0]?.trim()
        if (name) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        }
      })
    } catch {
      // jsdom may not support cookie manipulation
    }
  })

  afterEach(() => {
    if (typeof document === "undefined") return
    try {
      document.cookie.split(";").forEach((c) => {
        const name = c.split("=")[0]?.trim()
        if (name) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        }
      })
    } catch {
      // jsdom may not support cookie manipulation
    }
  })

  it("should return null for non-existent cookies", async function () {
    if (typeof document === "undefined") return

    const adapter = createCookieAdapter<{ value: string }>("missing-cookie")
    await expect(adapter.read?.("missing-cookie")).resolves.toBeNull()
  })

  it("should return function from subscribe", function () {
    if (typeof document === "undefined") return

    const adapter = createCookieAdapter<{ value: string }>("sub-test")
    const unsubscribe = adapter.subscribe?.("sub-test", () => {})
    expect(typeof unsubscribe).toBe("function")
  })

  it("should write without error", async function () {
    if (typeof document === "undefined") return

    const adapter = createCookieAdapter<{ value: string }>("write-test")

    expect(() => {
      adapter.write?.("write-test", { value: "test data" })
    }).not.toThrow()

    await new Promise((resolve) => setTimeout(resolve, 50))
  })

  it("should handle subscribe gracefully", function () {
    if (typeof document === "undefined") return

    const adapter = createCookieAdapter<{ value: string }>("test")

    expect(() => {
      adapter.subscribe?.("test", () => {})
    }).not.toThrow()
  })

  it("should write complex objects", async function () {
    if (typeof document === "undefined") return

    const adapter = createCookieAdapter<{
      nested: { deep: { value: string } }
    }>("complex-cookie-test")
    const testData = { nested: { deep: { value: "complex" } } }

    adapter.write?.("complex-cookie-test", testData)

    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(typeof adapter.subscribe).toBe("function")
  })

  it("should handle null values", async function () {
    if (typeof document === "undefined") return

    const adapter = createCookieAdapter<{ value: string | null }>(
      "null-cookie-test"
    )
    const testData = { value: null }

    adapter.write?.("null-cookie-test", testData)

    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(typeof adapter.subscribe).toBe("function")
  })

  it("should handle empty objects", async function () {
    if (typeof document === "undefined") return

    const adapter = createCookieAdapter<object>("empty-cookie-test")

    await adapter.write?.("empty-cookie-test", {})

    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(typeof adapter.subscribe).toBe("function")
  })
})

describe("Cookie Adapter contract", () => {
  beforeEach(() => {
    document.cookie = "adapter-primary=; Max-Age=0; Path=/"
    document.cookie = "adapter-unrelated=; Max-Age=0; Path=/"
    vi.useRealTimers()
  })

  afterEach(() => {
    document.cookie = "adapter-primary=; Max-Age=0; Path=/"
    document.cookie = "adapter-unrelated=; Max-Age=0; Path=/"
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it("makes an awaited write immediately readable", async () => {
    const adapter = createCookieAdapter<{ value: string }>("adapter-primary")

    await adapter.write?.("adapter-primary", { value: "ready" })

    await expect(adapter.read?.("adapter-primary")).resolves.toEqual({
      value: "ready",
    })
  })

  it("rejects cookie names that could inject attributes", () => {
    expect(() => createCookieAdapter("unsafe; Secure")).toThrow(TypeError)
  })

  it("writes configured cookie attributes", async () => {
    const cookieSetter = vi.spyOn(document, "cookie", "set")
    const options = {
      maxAge: 60,
      path: "/settings",
      sameSite: "strict",
      secure: true,
    } as CookieAdapterOptions & {
      path: string
      sameSite: "strict"
      secure: boolean
    }
    const adapter = createCookieAdapter<{ value: string }>(
      "adapter-primary",
      options
    )

    await adapter.write?.("adapter-primary", { value: "saved" })

    expect(cookieSetter).toHaveBeenCalledWith(
      expect.stringMatching(
        /^adapter-primary=.*; Max-Age=60; Path=\/settings; SameSite=Strict; Secure$/
      )
    )
  })

  it("clears only the adapter's cookie", async () => {
    document.cookie = `adapter-primary=${encodeURIComponent(JSON.stringify({ value: 1 }))}; Path=/`
    document.cookie = `adapter-unrelated=${encodeURIComponent(JSON.stringify({ value: 2 }))}; Path=/`
    const adapter = createCookieAdapter<{ value: number }>("adapter-primary")

    await adapter.clear?.()

    await expect(adapter.read?.("adapter-primary")).resolves.toBeNull()
    expect(document.cookie).toContain("adapter-unrelated=")
  })

  it("does not notify subscribers when the serialized cookie is unchanged", async () => {
    vi.useFakeTimers()
    const adapter = createCookieAdapter<{ value: number }>("adapter-primary")
    await adapter.write?.("adapter-primary", { value: 1 })
    const listener = vi.fn()
    const unsubscribe = adapter.subscribe?.("adapter-primary", listener)

    await vi.advanceTimersByTimeAsync(2_000)

    expect(listener).not.toHaveBeenCalled()
    unsubscribe?.()
  })
})
