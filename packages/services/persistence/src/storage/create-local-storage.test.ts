import { beforeEach, describe, expect, it, vi } from "vitest"

import { createLocalStorage } from "./create-local-storage.js"
import { PersistenceError } from "../errors/persistence-error.js"

describe("createLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("round-trips raw strings", () => {
    const storage = createLocalStorage()
    storage.setItem("key", "value")
    expect(storage.getItem("key")).toBe("value")
  })

  it("notifies same-context writes made through the adapter", () => {
    const storage = createLocalStorage()
    const listener = vi.fn()
    const unsubscribe = storage.subscribe("key", listener, vi.fn())

    storage.setItem("key", "value")
    storage.removeItem("key")
    unsubscribe()

    expect(listener).toHaveBeenNthCalledWith(1, "value")
    expect(listener).toHaveBeenNthCalledWith(2, null)
  })

  it("receives matching cross-context storage events", () => {
    const storage = createLocalStorage()
    const listener = vi.fn()
    const unsubscribe = storage.subscribe("key", listener, vi.fn())

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "key",
        newValue: "external",
        storageArea: window.localStorage,
      })
    )

    unsubscribe()
    expect(listener).toHaveBeenCalledWith("external")
  })

  it("notifies subscribers created by another adapter in the same context", () => {
    const writer = createLocalStorage()
    const reader = createLocalStorage()
    const listener = vi.fn()
    const unsubscribe = reader.subscribe("key", listener, vi.fn())

    writer.setItem("key", "shared")
    unsubscribe()

    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenCalledWith("shared")
  })

  it("does not notify when a write does not change storage", () => {
    const storage = createLocalStorage()
    const listener = vi.fn()
    const unsubscribe = storage.subscribe("key", listener, vi.fn())

    storage.setItem("key", "value")
    storage.setItem("key", "value")
    storage.removeItem("key")
    storage.removeItem("key")
    unsubscribe()

    expect(listener).toHaveBeenCalledTimes(2)
    expect(listener).toHaveBeenNthCalledWith(1, "value")
    expect(listener).toHaveBeenNthCalledWith(2, null)
  })

  it("treats a cross-context clear event as removal", () => {
    const storage = createLocalStorage()
    const listener = vi.fn()
    const unsubscribe = storage.subscribe("key", listener, vi.fn())

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: null,
        newValue: null,
        storageArea: window.localStorage,
      })
    )

    unsubscribe()
    expect(listener).toHaveBeenCalledWith(null)
  })

  it("keeps duplicate subscriptions independent", () => {
    const storage = createLocalStorage()
    const listener = vi.fn()
    const unsubscribeFirst = storage.subscribe("key", listener, vi.fn())
    const unsubscribeSecond = storage.subscribe("key", listener, vi.fn())

    unsubscribeFirst()
    storage.setItem("key", "value")
    unsubscribeSecond()

    expect(listener).toHaveBeenCalledOnce()
  })

  it("reports an unavailable browser runtime", () => {
    const storage = createLocalStorage({ getWindow: () => undefined })

    expect(() => storage.getItem("key")).toThrowError(PersistenceError)
    expect(() => storage.getItem("key")).toThrowError(
      expect.objectContaining({
        code: "unavailable",
        operation: "read",
      })
    )
  })

  it("normalizes subscription setup failures and rolls back registration", () => {
    let shouldThrow = true
    const addEventListener = vi.fn((): void => {
      if (shouldThrow) throw new Error("event registration failed")
    })
    const fakeWindow = {
      localStorage: window.localStorage,
      addEventListener,
      removeEventListener: vi.fn(),
    } as unknown as Window
    const storage = createLocalStorage({ getWindow: () => fakeWindow })
    const listener = vi.fn()

    expect(() => storage.subscribe("key", listener, vi.fn())).toThrowError(
      expect.objectContaining({
        name: "PersistenceError",
        code: "storage",
        operation: "subscribe",
        key: "key",
      })
    )
    expect(listener).not.toHaveBeenCalled()

    shouldThrow = false
    storage.setItem("key", "value")
    expect(listener).not.toHaveBeenCalled()
  })
})
