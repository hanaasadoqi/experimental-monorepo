import { describe, expect, it } from "vitest"

import { convertTokensToCSS } from "./convert-tokens-to-css"
import { flattenTokens } from "../normalize/flatten-tokens"

describe("convertTokensToCSS", () => {
  it("converts simple token objects to CSS", () => {
    const tokens = {
      primary: "hsl(217, 91%, 60%)",
      secondary: "hsl(217, 32%, 17%)",
    }
    const result = convertTokensToCSS(tokens)
    expect(result).toContain("--primary: hsl(217, 91%, 60%);")
    expect(result).toContain("--secondary: hsl(217, 32%, 17%);")
  })

  it("converts multiple tokens to multiple CSS variables", () => {
    const tokens = {
      spacing1: "0.25rem",
      spacing2: "0.5rem",
      spacing3: "0.75rem",
    }
    const result = convertTokensToCSS(tokens)
    const lines = result.split("\n")
    expect(lines).toHaveLength(3)
    expect(lines[0]).toBe("--spacing1: 0.25rem;")
    expect(lines[1]).toBe("--spacing2: 0.5rem;")
    expect(lines[2]).toBe("--spacing3: 0.75rem;")
  })

  it("handles prefixed token names", () => {
    const tokens = {
      "color-primary": "hsl(217, 91%, 60%)",
      "color-secondary": "hsl(217, 32%, 17%)",
    }
    const result = convertTokensToCSS(tokens)
    expect(result).toContain("--color-primary: hsl(217, 91%, 60%);")
    expect(result).toContain("--color-secondary: hsl(217, 32%, 17%);")
  })

  it("handles empty token objects", () => {
    const tokens = {}
    const result = convertTokensToCSS(tokens)
    expect(result).toBe("")
  })

  it("preserves value order and formatting", () => {
    const tokens = {
      "shadow-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "shadow-md":
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    }
    const result = convertTokensToCSS(tokens)
    expect(result).toContain("--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);")
    expect(result).toContain(
      "--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);"
    )
  })

  it("handles HSL, RGB, and hex color values", () => {
    const tokens = {
      hsl: "hsl(217, 91%, 60%)",
      rgb: "rgb(51, 176, 255)",
      hex: "#33b0ff",
    }
    const result = convertTokensToCSS(tokens)
    expect(result).toContain("--hsl: hsl(217, 91%, 60%);")
    expect(result).toContain("--rgb: rgb(51, 176, 255);")
    expect(result).toContain("--hex: #33b0ff;")
  })
})

describe("Integration: flatten then convert", () => {
  it("flattens nested tokens and converts to CSS", () => {
    const tokens = {
      colors: {
        primary: {
          DEFAULT: "hsl(217, 91%, 60%)",
          foreground: "hsl(210, 40%, 98%)",
        },
      },
    }
    const flattened = flattenTokens(tokens, "color")
    const css = convertTokensToCSS(flattened)
    expect(css).toContain("--color-colors-primary-DEFAULT: hsl(217, 91%, 60%);")
    expect(css).toContain(
      "--color-colors-primary-foreground: hsl(210, 40%, 98%);"
    )
  })

  it("handles complete design system token structure", () => {
    const tokens = {
      spacing: {
        1: "0.25rem",
        2: "0.5rem",
        4: "1rem",
      },
      colors: {
        primary: "hsl(217, 91%, 60%)",
        secondary: "hsl(217, 32%, 17%)",
      },
    }
    const flattened = flattenTokens(tokens)
    const css = convertTokensToCSS(flattened)
    expect(css).toContain("--spacing-1: 0.25rem;")
    expect(css).toContain("--spacing-2: 0.5rem;")
    expect(css).toContain("--spacing-4: 1rem;")
    expect(css).toContain("--colors-primary: hsl(217, 91%, 60%);")
    expect(css).toContain("--colors-secondary: hsl(217, 32%, 17%);")
  })
})
