import { describe, expect, it } from "vitest"

import { spacing } from "./spacing"

describe("Spacing Tokens", () => {
  it("exports spacing object", () => {
    expect(spacing).toBeDefined()
    expect(typeof spacing).toBe("object")
  })

  it("has base scale values (0, 1, 2, 4, 8, etc.)", () => {
    expect(spacing[0]).toBe("0")
    expect(spacing[1]).toBe("0.25rem")
    expect(spacing[2]).toBe("0.5rem")
    expect(spacing[4]).toBe("1rem")
    expect(spacing[8]).toBe("2rem")
  })

  it("all spacing values are valid CSS units", () => {
    const isValidCSSUnit = (value: string) => {
      return /^(0|auto|[\d./]+(?:rem|px|%|vw)?)$/.test(value)
    }

    for (const value of Object.values(spacing)) {
      expect(isValidCSSUnit(value as string)).toBe(true)
    }
  })

  it("has fractional width values", () => {
    expect(spacing["1/2"]).toBe("50%")
    expect(spacing["1/3"]).toBe("33.333333%")
    expect(spacing["2/3"]).toBe("66.666667%")
    expect(spacing["1/4"]).toBe("25%")
  })

  it("has special values (full, screen, auto)", () => {
    expect(spacing.full).toBe("100%")
    expect(spacing.screen).toBe("100vw")
    expect(spacing.auto).toBe("auto")
  })

  it("has decimal step values (1.5, 2.5, 3.5)", () => {
    expect(spacing["1.5"]).toBe("0.375rem")
    expect(spacing["2.5"]).toBe("0.625rem")
    expect(spacing["3.5"]).toBe("0.875rem")
  })

  it("is a consistent 4px base unit scale", () => {
    expect(spacing[1]).toBe("0.25rem") // 4px
    expect(spacing[2]).toBe("0.5rem") // 8px
    expect(spacing[3]).toBe("0.75rem") // 12px
    expect(spacing[4]).toBe("1rem") // 16px (1rem = 16px)
  })

  it("covers common tailwind spacing values", () => {
    expect(spacing.px).toBeDefined()
    expect(spacing[0]).toBeDefined()
    expect(spacing[2]).toBeDefined()
    expect(spacing[4]).toBeDefined()
    expect(spacing[6]).toBeDefined()
    expect(spacing[12]).toBeDefined()
  })
})
