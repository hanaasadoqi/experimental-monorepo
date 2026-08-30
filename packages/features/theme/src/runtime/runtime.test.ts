import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { applyColorScheme, getAppliedColorScheme } from "./apply-color-scheme"
import {
  getSystemColorScheme,
  resolveColorScheme,
} from "./resolve-color-scheme"
import type { AppearancePreference, ResolvedColorScheme } from "../types"

describe("resolveColorScheme", () => {
  const preferences: AppearancePreference[] = ["light", "dark", "system"]
  const systemMatchesValues = [true, false]

  const expected: Record<
    AppearancePreference,
    Record<"true" | "false", ResolvedColorScheme>
  > = {
    light: { true: "light", false: "light" },
    dark: { true: "dark", false: "dark" },
    system: { true: "dark", false: "light" },
  }

  for (const preference of preferences) {
    for (const systemMatches of systemMatchesValues) {
      it(`preference=${preference}, systemMatches=${systemMatches} -> ${expected[preference][String(systemMatches) as "true" | "false"]}`, () => {
        expect(resolveColorScheme(preference, systemMatches)).toBe(
          expected[preference][String(systemMatches) as "true" | "false"]
        )
      })
    }
  }

  it("'light' preference always resolves to 'light' regardless of system state", () => {
    expect(resolveColorScheme("light", true)).toBe("light")
    expect(resolveColorScheme("light", false)).toBe("light")
  })

  it("'dark' preference always resolves to 'dark' regardless of system state", () => {
    expect(resolveColorScheme("dark", true)).toBe("dark")
    expect(resolveColorScheme("dark", false)).toBe("dark")
  })

  it("'system' preference defers to systemMatches", () => {
    expect(resolveColorScheme("system", true)).toBe("dark")
    expect(resolveColorScheme("system", false)).toBe("light")
  })
})

describe("getSystemColorScheme", () => {
  const originalMatchMedia = window.matchMedia

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it("returns 'dark' when the media query matches", () => {
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia
    expect(getSystemColorScheme()).toBe("dark")
  })

  it("returns 'light' when the media query does not match", () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
    }) as unknown as typeof window.matchMedia
    expect(getSystemColorScheme()).toBe("light")
  })

  it("queries '(prefers-color-scheme: dark)'", () => {
    const matchMediaSpy = vi.fn().mockReturnValue({ matches: false })
    window.matchMedia = matchMediaSpy as unknown as typeof window.matchMedia
    getSystemColorScheme()
    expect(matchMediaSpy).toHaveBeenCalledWith("(prefers-color-scheme: dark)")
  })

  it("falls back to 'light' when matchMedia throws", () => {
    window.matchMedia = vi.fn().mockImplementation(() => {
      throw new Error("not supported")
    }) as unknown as typeof window.matchMedia
    expect(getSystemColorScheme()).toBe("light")
  })

  it("falls back to 'light' when matchMedia is unavailable", () => {
    // @ts-expect-error simulating an environment without matchMedia
    window.matchMedia = undefined
    expect(getSystemColorScheme()).toBe("light")
  })
})

describe("applyColorScheme", () => {
  let element: HTMLElement

  beforeEach(() => {
    element = document.createElement("html")
  })

  it("adds the 'dark' class when scheme is 'dark'", () => {
    applyColorScheme(element, "dark")
    expect(element.classList.contains("dark")).toBe(true)
  })

  it("removes the 'dark' class when scheme is 'light'", () => {
    element.classList.add("dark")
    applyColorScheme(element, "light")
    expect(element.classList.contains("dark")).toBe(false)
  })

  it("sets data-theme to 'dark'", () => {
    applyColorScheme(element, "dark")
    expect(element.getAttribute("data-theme")).toBe("dark")
  })

  it("sets data-theme to 'light'", () => {
    applyColorScheme(element, "light")
    expect(element.getAttribute("data-theme")).toBe("light")
  })

  it("sets style.colorScheme to 'dark'", () => {
    applyColorScheme(element, "dark")
    expect(element.style.colorScheme).toBe("dark")
  })

  it("sets style.colorScheme to 'light'", () => {
    applyColorScheme(element, "light")
    expect(element.style.colorScheme).toBe("light")
  })

  it("updates all three DOM properties atomically from the same value", () => {
    applyColorScheme(element, "dark")
    expect(element.classList.contains("dark")).toBe(true)
    expect(element.getAttribute("data-theme")).toBe("dark")
    expect(element.style.colorScheme).toBe("dark")

    applyColorScheme(element, "light")
    expect(element.classList.contains("dark")).toBe(false)
    expect(element.getAttribute("data-theme")).toBe("light")
    expect(element.style.colorScheme).toBe("light")
  })

  it("keeps the light and dark scheme classes mutually exclusive", () => {
    element.classList.add("light")

    applyColorScheme(element, "dark")
    expect(element.classList.contains("dark")).toBe(true)
    expect(element.classList.contains("light")).toBe(false)

    applyColorScheme(element, "light")
    expect(element.classList.contains("dark")).toBe(false)
    expect(element.classList.contains("light")).toBe(true)
  })

  it("is idempotent when applying the same scheme twice", () => {
    applyColorScheme(element, "dark")
    applyColorScheme(element, "dark")
    expect(element.classList.contains("dark")).toBe(true)
    expect(
      Array.from(element.classList).filter((cls) => cls === "dark")
    ).toHaveLength(1)
    expect(element.getAttribute("data-theme")).toBe("dark")
    expect(element.style.colorScheme).toBe("dark")
  })
})

describe("getAppliedColorScheme", () => {
  let element: HTMLElement

  beforeEach(() => {
    element = document.createElement("html")
  })

  it("reads 'dark' back from data-theme", () => {
    applyColorScheme(element, "dark")
    expect(getAppliedColorScheme(element)).toBe("dark")
  })

  it("reads 'light' back from data-theme", () => {
    applyColorScheme(element, "light")
    expect(getAppliedColorScheme(element)).toBe("light")
  })

  it("defaults to 'light' when data-theme is not set", () => {
    expect(getAppliedColorScheme(element)).toBe("light")
  })

  it("round-trips through applyColorScheme for every scheme", () => {
    const schemes: ResolvedColorScheme[] = ["light", "dark"]
    for (const scheme of schemes) {
      applyColorScheme(element, scheme)
      expect(getAppliedColorScheme(element)).toBe(scheme)
    }
  })
})
