import { beforeEach, describe, expect, it } from "vitest"

import {
  applyAppearanceToDocument,
  applyScopeThemeToElement,
  applyThemeCSSVariablesToDocument,
  clearThemeCSSVariables,
} from "./browser-theme-applier"

describe("browser theme applier", () => {
  beforeEach(() => {
    document.documentElement.className = "font-owned"
    document.documentElement.removeAttribute("data-theme")
    document.documentElement.removeAttribute("style")
  })

  it("applies appearance without removing unrelated root classes", () => {
    applyAppearanceToDocument("dark")
    expect(document.documentElement.classList.contains("font-owned")).toBe(true)
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.classList.contains("light")).toBe(false)
    expect(document.documentElement.dataset.theme).toBe("dark")
    expect(document.documentElement.style.colorScheme).toBe("dark")
  })

  it("applies and clears CSS variables", () => {
    applyThemeCSSVariablesToDocument({ "--primary": "red", "--ring": "blue" })
    clearThemeCSSVariables(["--primary"])
    expect(document.documentElement.style.getPropertyValue("--primary")).toBe(
      ""
    )
    expect(document.documentElement.style.getPropertyValue("--ring")).toBe(
      "blue"
    )
  })

  it("applies and removes scoped overrides", () => {
    const element = document.createElement("section")
    applyScopeThemeToElement(element, { isDarkMode: true, primaryColor: "red" })
    expect(element.dataset.scopeDarkMode).toBe("true")
    expect(element.style.getPropertyValue("--primary")).toBe("red")
    applyScopeThemeToElement(element, {})
    expect(element.hasAttribute("data-scope-dark-mode")).toBe(false)
    expect(element.style.getPropertyValue("--primary")).toBe("")
  })
})
