import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { applyAppearanceToDocument } from "@repo/adapters-theme-browser"
import { resolveAppearance } from "@repo/runtime-theme"

/**
 * Integration test: Theme → DOM sync behavior
 *
 * Tests that the appearance syncing logic correctly updates DOM when theme changes.
 * This tests the domain logic independently of the React context setup complexity.
 */
describe("Theme preference → DOM sync", () => {
  beforeEach(() => {
    document.documentElement.className = ""
    document.documentElement.removeAttribute("data-theme")
    document.documentElement.style.colorScheme = ""
  })

  afterEach(() => {
    document.documentElement.className = ""
    document.documentElement.removeAttribute("data-theme")
    document.documentElement.style.colorScheme = ""
  })

  it("applies dark class and data-theme attribute when appearance is dark", () => {
    applyAppearanceToDocument("dark")

    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.dataset.theme).toBe("dark")
    expect(document.documentElement.style.colorScheme).toBe("dark")
  })

  it("applies light class and data-theme attribute when appearance is light", () => {
    applyAppearanceToDocument("light")

    expect(document.documentElement.classList.contains("light")).toBe(true)
    expect(document.documentElement.dataset.theme).toBe("light")
    expect(document.documentElement.style.colorScheme).toBe("light")
  })

  it("does not duplicate light/dark classes when switching appearance", () => {
    applyAppearanceToDocument("light")
    expect(document.documentElement.classList.contains("light")).toBe(true)
    expect(document.documentElement.classList.contains("dark")).toBe(false)

    applyAppearanceToDocument("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.classList.contains("light")).toBe(false)
  })

  it("preserves data-theme consistency across multiple changes", () => {
    const appearances = ["dark", "light", "dark", "light"] as const

    for (const appearance of appearances) {
      applyAppearanceToDocument(appearance)
      expect(document.documentElement.dataset.theme).toBe(appearance)
    }
  })

  it("correctly handles rapid successive appearance changes", () => {
    // Simulate rapid changes like user clicking theme toggle multiple times
    for (let i = 0; i < 10; i++) {
      const appearance = i % 2 === 0 ? "dark" : "light"
      applyAppearanceToDocument(appearance)

      // Verify no duplicates
      const hasDark = document.documentElement.classList.contains("dark")
      const hasLight = document.documentElement.classList.contains("light")
      expect(hasDark || hasLight).toBe(true)
      expect(hasDark && hasLight).toBe(false)
      expect(document.documentElement.dataset.theme).toBe(appearance)
    }
  })

  it("maintains colorScheme property in sync with class", () => {
    const appearances = ["dark", "light"] as const

    for (const appearance of appearances) {
      applyAppearanceToDocument(appearance)
      expect(document.documentElement.style.colorScheme).toBe(appearance)
      expect(document.documentElement.classList.contains(appearance)).toBe(true)
    }
  })

  it.each([
    ["system", "dark", "dark"],
    ["system", "light", "light"],
    ["dark", "light", "dark"],
  ] as const)(
    "resolves %s against system %s before applying %s",
    (preference, systemAppearance, expected) => {
      applyAppearanceToDocument(resolveAppearance(preference, systemAppearance))

      expect(document.documentElement.dataset.theme).toBe(expected)
      expect(document.documentElement.classList.contains(expected)).toBe(true)
    }
  )
})
