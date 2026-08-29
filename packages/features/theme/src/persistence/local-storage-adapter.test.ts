import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { describeAdapterContract } from "./adapter.contract.test"
import { createLocalStorageAppearanceAdapter } from "./local-storage-adapter"

const STORAGE_KEY = "appearance-preference"

beforeEach(() => {
  localStorage.clear()
})

describeAdapterContract(() => createLocalStorageAppearanceAdapter())

describe("createLocalStorageAppearanceAdapter", () => {
  afterEach(() => {
    localStorage.clear()
  })

  it("uses the 'appearance-preference' key", () => {
    const adapter = createLocalStorageAppearanceAdapter()
    adapter.write("dark")
    expect(localStorage.getItem(STORAGE_KEY)).toBe("dark")
  })

  it("reads a value written directly to localStorage", () => {
    localStorage.setItem(STORAGE_KEY, "light")
    const adapter = createLocalStorageAppearanceAdapter()
    expect(adapter.read()).toBe("light")
  })

  it("writes a value readable directly from localStorage", () => {
    const adapter = createLocalStorageAppearanceAdapter()
    adapter.write("system")
    expect(localStorage.getItem(STORAGE_KEY)).toBe("system")
  })

  it("ignores invalid persisted values", () => {
    localStorage.setItem(STORAGE_KEY, "not-a-real-preference")
    const adapter = createLocalStorageAppearanceAdapter()
    expect(adapter.read()).toBeNull()
  })

  it("handles unavailable localStorage gracefully", () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      window,
      "localStorage"
    )

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("localStorage is unavailable")
      },
    })

    try {
      const adapter = createLocalStorageAppearanceAdapter()
      expect(() => adapter.read()).not.toThrow()
      expect(adapter.read()).toBeNull()
      expect(() => adapter.write("dark")).not.toThrow()
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(window, "localStorage", originalDescriptor)
      }
    }
  })

  it("notifies subscribers when a native storage event fires for the tracked key", () => {
    const adapter = createLocalStorageAppearanceAdapter()
    const listener = vi.fn()
    const unsubscribe = adapter.subscribe(listener)

    localStorage.setItem(STORAGE_KEY, "dark")
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: STORAGE_KEY,
        newValue: "dark",
        oldValue: null,
        storageArea: localStorage,
      })
    )

    expect(listener).toHaveBeenCalledWith("dark")
    unsubscribe()
  })

  it("ignores storage events for unrelated keys", () => {
    const adapter = createLocalStorageAppearanceAdapter()
    const listener = vi.fn()
    const unsubscribe = adapter.subscribe(listener)

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "some-other-key",
        newValue: "dark",
        oldValue: null,
        storageArea: localStorage,
      })
    )

    expect(listener).not.toHaveBeenCalled()
    unsubscribe()
  })

  it("ignores storage events carrying invalid values", () => {
    const adapter = createLocalStorageAppearanceAdapter()
    const listener = vi.fn()
    const unsubscribe = adapter.subscribe(listener)

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: STORAGE_KEY,
        newValue: "garbage",
        oldValue: null,
        storageArea: localStorage,
      })
    )

    expect(listener).not.toHaveBeenCalled()
    unsubscribe()
  })
})
