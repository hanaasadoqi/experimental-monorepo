import { describe, expect, it } from "vitest"
import { createMatchMedia, installBrowserMocks } from "./browser.js"
import { MemoryStorage } from "./storage.js"

describe("browser mocks", () => {
  it("preserves the queried media string and configured match state", () => {
    const matchMedia = createMatchMedia(true)

    expect(matchMedia("(prefers-reduced-motion: reduce)")).toMatchObject({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
    })
  })

  it("installs missing APIs without replacing existing values", () => {
    const existingStorage = new MemoryStorage()
    const target = { localStorage: existingStorage }

    installBrowserMocks(target)

    expect(target.localStorage).toBe(existingStorage)
    expect(target).toHaveProperty("matchMedia")
    expect(target).toHaveProperty("ResizeObserver")
  })
})
