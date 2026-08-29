import { describe, expect, it } from "vitest"

import { colors } from "./colors"

describe("Color Tokens", () => {
  it("exports colors object", () => {
    expect(colors).toBeDefined()
    expect(typeof colors).toBe("object")
  })

  it("has semantic intent colors", () => {
    expect(colors.primary).toBeDefined()
    expect(colors.secondary).toBeDefined()
    expect(colors.destructive).toBeDefined()
  })

  it("primary color has DEFAULT and foreground variants", () => {
    expect(colors.primary.DEFAULT).toBeDefined()
    expect(colors.primary.foreground).toBeDefined()
    expect(typeof colors.primary.DEFAULT).toBe("string")
    expect(typeof colors.primary.foreground).toBe("string")
  })

  it("all color values are valid HSL or hex strings", () => {
    const isValidColor = (value: string) => {
      return /^hsl\(/.test(value) || /^#[0-9a-f]{6}$/i.test(value)
    }

    const checkAllColors = (obj: Record<string, unknown>) => {
      for (const [, value] of Object.entries(obj)) {
        if (typeof value === "string") {
          expect(isValidColor(value)).toBe(true)
        } else if (typeof value === "object" && value !== null) {
          checkAllColors(value as Record<string, unknown>)
        }
      }
    }

    checkAllColors(colors as Record<string, unknown>)
  })

  it("has neutral colors (foreground, background, muted, etc.)", () => {
    expect(colors.foreground).toBeDefined()
    expect(colors.background).toBeDefined()
    expect(colors.muted).toBeDefined()
    expect(colors.accent).toBeDefined()
    expect(colors.ring).toBeDefined()
    expect(colors.input).toBeDefined()
    expect(colors.border).toBeDefined()
  })

  it("has dark mode variants", () => {
    expect(colors.dark).toBeDefined()
    expect(colors.dark.foreground).toBeDefined()
    expect(colors.dark.background).toBeDefined()
    expect(colors.dark.muted).toBeDefined()
  })

  it("all color variants are strings (not objects with non-color values)", () => {
    const validateColor = (value: unknown): boolean => {
      if (typeof value === "string") {
        return true
      }
      if (typeof value === "object" && value !== null) {
        return Object.values(value).every((v) => validateColor(v))
      }
      return false
    }

    expect(validateColor(colors)).toBe(true)
  })
})
