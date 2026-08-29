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
  })

  it("primary color has DEFAULT and foreground variants", () => {
    expect(colors.primary.semantic.DEFAULT).toBeDefined()
    expect(colors.primary.semantic.light.foreground).toBeDefined()
    expect(typeof colors.primary.semantic.DEFAULT).toBe("string")
    expect(typeof colors.primary.semantic.light.foreground).toBe("string")
  })

  // it("all color values are valid HSL or hex strings", () => {
  //   const isValidColor = (value: string) => {
  //     return /^hsl\(/.test(value) || /^#[0-9a-f]{6}$/i.test(value)
  //   }

  //   const checkAllColors = (obj: Record<string, unknown>) => {
  //     for (const [, value] of Object.entries(obj)) {
  //       if (typeof value === "string") {
  //         expect(isValidColor(value)).toBe(true)
  //       } else if (typeof value === "object" && value !== null) {
  //         checkAllColors(value as Record<string, unknown>)
  //       }
  //     }
  //   }

  //   checkAllColors(colors as Record<string, unknown>)
  // })

  it("has neutral colors (foreground, background, muted, etc.)", () => {
    expect(colors.default.semantic.light.foreground).toBeDefined()
    expect(colors.default.semantic.light.background).toBeDefined()
    expect(colors.accent).toBeDefined()
  })

  it("has dark mode variants", () => {
    expect(colors.default.semantic.dark).toBeDefined()
    expect(colors.default.semantic.dark.foreground).toBeDefined()
    expect(colors.default.semantic.dark.background).toBeDefined()
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
