import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createCookiePreferencesAdapter,
  createLocalStoragePreferencesAdapter,
} from "./index"

describe("Preferences persistence adapters", () => {
  beforeEach(() => {
    localStorage.clear()
    document.cookie = "appearance-preference=; Max-Age=0; Path=/"
    document.cookie = "test-appearance-preference=; Max-Age=0; Path=/"
  })

  it("round-trips the active preference through localStorage", () => {
    const adapter = createLocalStoragePreferencesAdapter()

    adapter.write("dark")

    expect(localStorage.getItem("appearance-preference")).toBe("dark")
    expect(adapter.read()).toBe("dark")
  })

  it("rejects an invalid localStorage value", () => {
    localStorage.setItem("appearance-preference", "automatic")

    expect(createLocalStoragePreferencesAdapter().read()).toBeNull()
  })

  it("publishes valid external localStorage changes", () => {
    const listener = vi.fn()
    const unsubscribe =
      createLocalStoragePreferencesAdapter().subscribe(listener)

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "appearance-preference",
        newValue: "light",
        storageArea: localStorage,
      })
    )

    expect(listener).toHaveBeenCalledWith("light")
    unsubscribe()
  })

  it("ignores invalid external localStorage changes", () => {
    const listener = vi.fn()
    const unsubscribe =
      createLocalStoragePreferencesAdapter().subscribe(listener)

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "appearance-preference",
        newValue: "automatic",
        storageArea: localStorage,
      })
    )

    expect(listener).not.toHaveBeenCalled()
    unsubscribe()
  })

  it("round-trips the active preference through the server-readable cookie", () => {
    const adapter = createCookiePreferencesAdapter({
      name: "test-appearance-preference",
      secure: false,
    })

    adapter.write("system")

    expect(document.cookie).toContain("test-appearance-preference=system")
    expect(adapter.read()).toBe("system")
  })

  it("rejects an invalid cookie value", () => {
    document.cookie = "test-appearance-preference=automatic; Path=/"

    expect(
      createCookiePreferencesAdapter({
        name: "test-appearance-preference",
      }).read()
    ).toBeNull()
  })
})
