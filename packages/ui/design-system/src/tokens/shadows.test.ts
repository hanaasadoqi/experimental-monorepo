import { describe, expect, it } from "vitest"

import { shadows } from "./shadows"

describe("Shadow Tokens", () => {
  it("exports shadows object", () => {
    expect(shadows).toBeDefined()
    expect(typeof shadows).toBe("object")
  })

  it("has elevation levels (none, sm, base, md, lg, xl, 2xl)", () => {
    expect(shadows.none).toBeDefined()
    expect(shadows.sm).toBeDefined()
    expect(shadows.base).toBeDefined()
    expect(shadows.md).toBeDefined()
    expect(shadows.lg).toBeDefined()
    expect(shadows.xl).toBeDefined()
    expect(shadows["2xl"]).toBeDefined()
  })

  it("has inner shadow", () => {
    expect(shadows.inner).toBeDefined()
  })

  it("has elevation object with low, medium, high levels", () => {
    expect(shadows.elevation).toBeDefined()
    expect(shadows.elevation.low).toBeDefined()
    expect(shadows.elevation.medium).toBeDefined()
    expect(shadows.elevation.high).toBeDefined()
  })

  it("all shadow values are valid CSS shadow syntax or 'none'", () => {
    for (const value of Object.values(shadows)) {
      if (typeof value === "string") {
        expect(
          value === "none" || value.includes("rgba") || value.includes("0 ")
        ).toBe(true)
      } else if (typeof value === "object" && value !== null) {
        for (const shadowValue of Object.values(value)) {
          expect(
            (shadowValue as string) === "none" ||
              (shadowValue as string).includes("rgba") ||
              (shadowValue as string).includes("0 ")
          ).toBe(true)
        }
      }
    }
  })

  it("shadow values use rgba for color opacity", () => {
    const checkForRgba = (obj: Record<string, unknown>) => {
      for (const value of Object.values(obj)) {
        if (typeof value === "string" && value !== "none") {
          expect(value).toContain("rgba")
        } else if (typeof value === "object" && value !== null) {
          checkForRgba(value as Record<string, unknown>)
        }
      }
    }

    checkForRgba(shadows as Record<string, unknown>)
  })

  it("shadows follow consistent opacity pattern", () => {
    expect(shadows.sm).toContain("rgba(0, 0, 0, 0.05)")
    expect(shadows.base).toContain("rgba(0, 0, 0, 0.1)")
    expect(shadows.md).toContain("rgba(0, 0, 0, 0.1)")
    expect(shadows["2xl"]).toContain("rgba(0, 0, 0, 0.25)")
  })

  it("elevation levels map to appropriate shadow levels", () => {
    expect(shadows.elevation.low).toBe(shadows.sm)
    expect(shadows.elevation.medium).toBe(shadows.md)
    expect(shadows.elevation.high).toBe(shadows.xl)
  })
})
