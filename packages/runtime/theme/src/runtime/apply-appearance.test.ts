import { describe, it, expect, beforeEach } from "vitest"
import { applyAppearance } from "./apply-appearance"

describe("applyAppearance (real DOM)", () => {
  beforeEach(() => {
    document.documentElement.className = ""
    document.documentElement.removeAttribute("data-theme")
    document.documentElement.style.colorScheme = ""
  })

  it("adds the dark class on document.documentElement for 'dark'", () => {
    applyAppearance("dark", document.documentElement)
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("removes the dark class on document.documentElement for 'light'", () => {
    document.documentElement.classList.add("dark")
    applyAppearance("light", document.documentElement)
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("sets dataset.theme to match the resolved appearance", () => {
    applyAppearance("dark", document.documentElement)
    expect(document.documentElement.dataset.theme).toBe("dark")
    applyAppearance("light", document.documentElement)
    expect(document.documentElement.dataset.theme).toBe("light")
  })

  it("sets style.colorScheme to match the resolved appearance", () => {
    applyAppearance("dark", document.documentElement)
    expect(document.documentElement.style.colorScheme).toBe("dark")
    applyAppearance("light", document.documentElement)
    expect(document.documentElement.style.colorScheme).toBe("light")
  })

  it("applies to a supplied root element instead of the default when given one", () => {
    const root = document.createElement("html")
    applyAppearance("dark", root)
    expect(root.classList.contains("dark")).toBe(true)
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })
})
