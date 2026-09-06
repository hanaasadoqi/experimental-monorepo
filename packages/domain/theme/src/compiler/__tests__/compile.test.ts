import { describe, it, expect } from "vitest"
import { compile } from "../compile"
import type { ThemeCompilationInput } from "../model"

describe("compile()", () => {
  const basePrimary = { l: 0.55, c: 0.15, h: 200 }
  const baseAccent = { l: 0.6, c: 0.12, h: 30 }
  const baseNeutral = { l: 0.5, c: 0.01, h: 0 }

  describe("determinism", () => {
    it("produces identical output for identical inputs", () => {
      const input: ThemeCompilationInput = {
        mode: "light",
        primary: basePrimary,
        accent: baseAccent,
        neutral: baseNeutral,
      }

      const result1 = compile(input)
      const result2 = compile(input)

      expect(result1.cssVariables).toEqual(result2.cssVariables)
      expect(result1.theme).toEqual(result2.theme)
      expect(result1.report).toEqual(result2.report)
    })

    it("produces identical CSS for identical colors in different calls", () => {
      const input: ThemeCompilationInput = {
        mode: "dark",
        primary: basePrimary,
      }

      const result1 = compile(input)
      const result2 = compile(input)

      // String comparison to ensure byte-identical output
      const vars1Keys = Object.keys(result1.cssVariables).sort()
      const vars2Keys = Object.keys(result2.cssVariables).sort()

      expect(vars1Keys).toEqual(vars2Keys)
      vars1Keys.forEach((key) => {
        expect(result1.cssVariables[key]).toBe(result2.cssVariables[key])
      })
    })
  })

  describe("mode-specific behavior", () => {
    it("compiles with light mode", () => {
      const input: ThemeCompilationInput = {
        mode: "light",
        primary: basePrimary,
        accent: baseAccent,
        neutral: baseNeutral,
      }

      const result = compile(input)

      expect(result.report.success).toBe(true)
      expect(result.theme?.mode).toBe("light")
      expect(result.cssVariables["--theme-mode"]).toBe("light")
    })

    it("compiles with dark mode", () => {
      const input: ThemeCompilationInput = {
        mode: "dark",
        primary: basePrimary,
        accent: baseAccent,
        neutral: baseNeutral,
      }

      const result = compile(input)

      expect(result.report.success).toBe(true)
      expect(result.theme?.mode).toBe("dark")
      expect(result.cssVariables["--theme-mode"]).toBe("dark")
    })

    it("foreground colors are derived from background regardless of mode", () => {
      const lightResult = compile({
        mode: "light",
        primary: basePrimary,
        accent: baseAccent,
        neutral: baseNeutral,
      })

      const darkResult = compile({
        mode: "dark",
        primary: basePrimary,
        accent: baseAccent,
        neutral: baseNeutral,
      })

      // Foreground is derived from the background color itself, not the mode
      // So it should be the same regardless of light or dark mode
      expect(lightResult.cssVariables["--color-primary-fg"]).toBe(
        darkResult.cssVariables["--color-primary-fg"]
      )
    })
  })

  describe("optional color handling", () => {
    it("derives accent when not provided", () => {
      const input: ThemeCompilationInput = {
        mode: "light",
        primary: basePrimary,
        // accent omitted
      }

      const result = compile(input)

      expect(result.report.success).toBe(true)
      expect(result.theme?.colors.accent).toBeDefined()
      expect(result.cssVariables["--color-accent"]).toBeDefined()
    })

    it("derives neutral when not provided", () => {
      const input: ThemeCompilationInput = {
        mode: "light",
        primary: basePrimary,
        accent: baseAccent,
        // neutral omitted
      }

      const result = compile(input)

      expect(result.report.success).toBe(true)
      expect(result.theme?.colors.neutral).toBeDefined()
      expect(result.cssVariables["--color-neutral"]).toBeDefined()
    })

    it("uses provided colors when given", () => {
      const input: ThemeCompilationInput = {
        mode: "light",
        primary: basePrimary,
        accent: baseAccent,
        neutral: baseNeutral,
      }

      const result = compile(input)

      expect(result.theme?.colors.primary).toEqual(basePrimary)
      expect(result.theme?.colors.accent).toEqual(baseAccent)
      expect(result.theme?.colors.neutral).toEqual(baseNeutral)
    })
  })

  describe("CSS variable generation", () => {
    it("generates base color variables", () => {
      const input: ThemeCompilationInput = {
        mode: "light",
        primary: basePrimary,
        accent: baseAccent,
        neutral: baseNeutral,
      }

      const result = compile(input)

      expect(result.cssVariables["--color-primary"]).toBeDefined()
      expect(result.cssVariables["--color-accent"]).toBeDefined()
      expect(result.cssVariables["--color-neutral"]).toBeDefined()
    })

    it("generates foreground color variables", () => {
      const input: ThemeCompilationInput = {
        mode: "light",
        primary: basePrimary,
        accent: baseAccent,
        neutral: baseNeutral,
      }

      const result = compile(input)

      expect(result.cssVariables["--color-primary-fg"]).toBeDefined()
      expect(result.cssVariables["--color-accent-fg"]).toBeDefined()
      expect(result.cssVariables["--color-neutral-fg"]).toBeDefined()
    })

    it("generates shade variables for all color families", () => {
      const input: ThemeCompilationInput = {
        mode: "light",
        primary: basePrimary,
        accent: baseAccent,
        neutral: baseNeutral,
      }

      const result = compile(input)

      // Should generate shades like --color-primary-50, --color-primary-100, etc.
      const primaryShades = Object.keys(result.cssVariables).filter((key) =>
        key.startsWith("--color-primary-") && !key.includes("fg")
      )
      const accentShades = Object.keys(result.cssVariables).filter((key) =>
        key.startsWith("--color-accent-") && !key.includes("fg")
      )
      const neutralShades = Object.keys(result.cssVariables).filter((key) =>
        key.startsWith("--color-neutral-") && !key.includes("fg")
      )

      expect(primaryShades.length).toBeGreaterThan(0)
      expect(accentShades.length).toBeGreaterThan(0)
      expect(neutralShades.length).toBeGreaterThan(0)
    })

    it("generates semantic color variables when provided", () => {
      const input: ThemeCompilationInput = {
        mode: "light",
        primary: basePrimary,
        semantic: {
          success: { l: 0.6, c: 0.1, h: 120 },
          destructive: { l: 0.5, c: 0.15, h: 0 },
        },
      }

      const result = compile(input)

      expect(result.cssVariables["--color-semantic-success"]).toBeDefined()
      expect(result.cssVariables["--color-semantic-destructive"]).toBeDefined()
    })

    it("stores mode as a CSS variable", () => {
      const lightResult = compile({
        mode: "light",
        primary: basePrimary,
      })

      const darkResult = compile({
        mode: "dark",
        primary: basePrimary,
      })

      expect(lightResult.cssVariables["--theme-mode"]).toBe("light")
      expect(darkResult.cssVariables["--theme-mode"]).toBe("dark")
    })
  })

  describe("CSS variable format", () => {
    it("generates valid oklch() CSS strings", () => {
      const input: ThemeCompilationInput = {
        mode: "light",
        primary: basePrimary,
      }

      const result = compile(input)

      const primaryCss = result.cssVariables["--color-primary"]
      // Should be in format: oklch(L C H)
      expect(primaryCss).toMatch(/^oklch\(.*\)$/)
    })

    it("all CSS values are strings", () => {
      const input: ThemeCompilationInput = {
        mode: "light",
        primary: basePrimary,
        accent: baseAccent,
        neutral: baseNeutral,
      }

      const result = compile(input)

      Object.entries(result.cssVariables).forEach(([key, value]) => {
        expect(typeof value).toBe("string")
        expect(value.length).toBeGreaterThan(0)
      })
    })
  })

  describe("error handling", () => {
    it("returns success=true for valid input", () => {
      const input: ThemeCompilationInput = {
        mode: "light",
        primary: basePrimary,
        accent: baseAccent,
        neutral: baseNeutral,
      }

      const result = compile(input)

      expect(result.report.success).toBe(true)
      expect(result.report.errors).toHaveLength(0)
    })

    it("handles invalid input gracefully", () => {
      const input: ThemeCompilationInput = {
        mode: "light",
        primary: { l: -1, c: -0.5, h: 400 } as any, // Invalid values
      }

      const result = compile(input)

      // Should still produce output or at least not crash
      expect(result.report).toBeDefined()
      expect(Array.isArray(result.report.errors)).toBe(true)
    })
  })

  describe("resolved theme structure", () => {
    it("returns a valid resolved theme object", () => {
      const input: ThemeCompilationInput = {
        mode: "light",
        primary: basePrimary,
        accent: baseAccent,
        neutral: baseNeutral,
      }

      const result = compile(input)

      expect(result.theme).toBeDefined()
      if (result.theme) {
        expect(result.theme.mode).toBe("light")
        expect(result.theme.colors.primary).toEqual(basePrimary)
        expect(result.theme.colors.accent).toEqual(baseAccent)
        expect(result.theme.colors.neutral).toEqual(baseNeutral)
        expect(typeof result.theme.colors.semantic).toBe("object")
      }
    })

    it("includes semantic colors in resolved theme", () => {
      const semantic = {
        success: { l: 0.6, c: 0.1, h: 120 },
        warning: { l: 0.65, c: 0.12, h: 45 },
      }

      const input: ThemeCompilationInput = {
        mode: "light",
        primary: basePrimary,
        semantic,
      }

      const result = compile(input)

      expect(result.theme?.colors.semantic).toEqual(semantic)
    })
  })
})
