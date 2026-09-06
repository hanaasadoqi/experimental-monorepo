import { createMatchMedia } from "@repo/foundation-test-mocks/browser"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { generateAppearanceBootstrapCode } from "./appearance-bootstrap"

function runBootstrap(preference: "light" | "dark" | "system") {
  Function(generateAppearanceBootstrapCode(preference))()
}

describe("appearance bootstrap", () => {
  beforeEach(() => {
    document.documentElement.className = "font-owned"
    document.documentElement.removeAttribute("data-theme")
    document.documentElement.removeAttribute("style")
  })

  afterEach(() => vi.unstubAllGlobals())

  it.each([
    ["light", true, "light"],
    ["dark", false, "dark"],
    ["system", false, "light"],
    ["system", true, "dark"],
  ] as const)(
    "applies %s with system dark=%s as %s",
    (preference, systemDark, expected) => {
      vi.stubGlobal("matchMedia", createMatchMedia(systemDark))
      runBootstrap(preference)

      expect(document.documentElement.classList.contains(expected)).toBe(true)
      expect(document.documentElement.classList.contains("font-owned")).toBe(
        true
      )
      expect(document.documentElement.dataset.theme).toBe(expected)
      expect(document.documentElement.style.colorScheme).toBe(expected)
    }
  )
})
