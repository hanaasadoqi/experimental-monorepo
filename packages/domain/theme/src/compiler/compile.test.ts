import { describe, it, expect } from "vitest"
import { compile } from "./compile"
import type { ThemeCompilationInput } from "./model"

describe("compile()", () => {
  const primaryColor = "oklch(55% 0.15 200)"

  describe("determinism", () => {
    it("produces identical output for identical inputs", () => {
      const input: ThemeCompilationInput = {
        primary: primaryColor,
      }

      const result1 = compile(input)
      const result2 = compile(input)

      expect(result1.cssVariables).toEqual(result2.cssVariables)
      expect(result1.theme).toEqual(result2.theme)
      expect(result1.report).toEqual(result2.report)
    })
  })

  describe("required and optional inputs", () => {
    it("compiles with primary color only", () => {
      const input: ThemeCompilationInput = {
        primary: primaryColor,
      }

      const result = compile(input)

      expect(result.report.success).toBe(true)
      expect(result.cssVariables["--color-primary"]).toBeDefined()
      expect(result.cssVariables["--color-primary-fg"]).toBeDefined()
      expect(result.theme?.colors.primary).toBe(primaryColor)
    })

    it("compiles with primary and accent when customAccent is true", () => {
      const accentColor = "oklch(60% 0.12 30)"
      const input: ThemeCompilationInput = {
        primary: primaryColor,
        accent: accentColor,
        customAccent: true,
      }

      const result = compile(input)

      expect(result.report.success).toBe(true)
      expect(result.cssVariables["--color-accent"]).toBeDefined()
      expect(result.cssVariables["--color-accent-fg"]).toBeDefined()
      expect(result.theme?.colors.accent).toBe(accentColor)
    })

    it("ignores accent when customAccent is false or undefined", () => {
      const accentColor = "oklch(60% 0.12 30)"
      const input: ThemeCompilationInput = {
        primary: primaryColor,
        accent: accentColor,
        customAccent: false,
      }

      const result = compile(input)

      expect(result.theme?.colors.accent).toBeUndefined()
      expect(result.cssVariables["--color-accent"]).toBeUndefined()
    })
  })

  describe("dark mode", () => {
    it("tracks isDarkMode in resolved theme", () => {
      const input: ThemeCompilationInput = {
        primary: primaryColor,
        isDarkMode: true,
      }

      const result = compile(input)

      expect(result.theme?.isDarkMode).toBe(true)
    })

    it("uses enableDarkMode to determine mode for CSS variables", () => {
      const inputDisabled: ThemeCompilationInput = {
        primary: primaryColor,
        isDarkMode: true,
        enableDarkMode: true,
      }

      const resultDisabled = compile(inputDisabled)
      expect(resultDisabled.cssVariables["--theme-mode"]).toBe("light")

      const inputEnabled: ThemeCompilationInput = {
        primary: primaryColor,
        isDarkMode: true,
        enableDarkMode: false,
      }

      const resultEnabled = compile(inputEnabled)
      expect(resultEnabled.cssVariables["--theme-mode"]).toBe("dark")
    })
  })

  describe("harmony", () => {
    it("stores harmony preference in resolved theme", () => {
      const input: ThemeCompilationInput = {
        primary: primaryColor,
        customAccent: true,
        accent: "oklch(60% 0.12 30)",
        harmony: "complementary",
      }

      const result = compile(input)

      expect(result.theme?.colors.harmony).toBe("complementary")
    })
  })

  describe("CSS variable generation", () => {
    it("generates base color variables in oklch() format", () => {
      const input: ThemeCompilationInput = {
        primary: primaryColor,
      }

      const result = compile(input)

      expect(result.cssVariables["--color-primary"]).toMatch(/^oklch\(.*\)$/)
      expect(result.cssVariables["--color-primary-fg"]).toMatch(/^oklch\(.*\)$/)
      expect(result.cssVariables["--color-default"]).toMatch(/^oklch\(.*\)$/)
    })

    it("generates shade scales", () => {
      const input: ThemeCompilationInput = {
        primary: primaryColor,
      }

      const result = compile(input)

      const primaryShades = Object.keys(result.cssVariables).filter(
        (key) => key.startsWith("--color-primary-") && !key.includes("fg")
      )

      expect(primaryShades.length).toBeGreaterThan(0)
    })

    it("generates default shades", () => {
      const input: ThemeCompilationInput = {
        primary: primaryColor,
      }

      const result = compile(input)

      const defaultShades = Object.keys(result.cssVariables).filter((key) =>
        key.startsWith("--color-default-")
      )

      expect(defaultShades.length).toBeGreaterThan(0)
    })
  })

  describe("error handling", () => {
    it("returns success=true for valid input", () => {
      const input: ThemeCompilationInput = {
        primary: primaryColor,
      }

      const result = compile(input)

      expect(result.report.success).toBe(true)
      expect(result.report.errors).toHaveLength(0)
    })
  })
})
