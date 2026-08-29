import { describe, expect, it } from "vitest"
import { flattenTokens } from "./flatten-tokens"

describe("flattenTokens", () => {
  it("flattens flat objects", () => {
    const tokens = {
      primary: "hsl(217, 91%, 60%)",
      secondary: "hsl(217, 32%, 17%)",
    }
    const result = flattenTokens(tokens)
    expect(result).toEqual({
      primary: "hsl(217, 91%, 60%)",
      secondary: "hsl(217, 32%, 17%)",
    })
  })

  it("flattens nested objects with prefix", () => {
    const tokens = {
      primary: {
        DEFAULT: "hsl(217, 91%, 60%)",
        foreground: "hsl(210, 40%, 98%)",
      },
    }
    const result = flattenTokens(tokens, "color")
    expect(result).toEqual({
      "color-primary-DEFAULT": "hsl(217, 91%, 60%)",
      "color-primary-foreground": "hsl(210, 40%, 98%)",
    })
  })

  it("handles deeply nested structures", () => {
    const tokens = {
      dark: {
        muted: {
          foreground: "hsl(217, 12%, 64%)",
        },
      },
    }
    const result = flattenTokens(tokens, "color")
    expect(result).toEqual({
      "color-dark-muted-foreground": "hsl(217, 12%, 64%)",
    })
  })

  it("handles mixed nested and flat values", () => {
    const tokens = {
      foreground: "hsl(217, 32%, 17%)",
      primary: {
        DEFAULT: "hsl(217, 91%, 60%)",
        foreground: "hsl(210, 40%, 98%)",
      },
    }
    const result = flattenTokens(tokens, "color")
    expect(result).toEqual({
      "color-foreground": "hsl(217, 32%, 17%)",
      "color-primary-DEFAULT": "hsl(217, 91%, 60%)",
      "color-primary-foreground": "hsl(210, 40%, 98%)",
    })
  })

  it("works without prefix", () => {
    const tokens = {
      primary: {
        DEFAULT: "hsl(217, 91%, 60%)",
      },
    }
    const result = flattenTokens(tokens)
    expect(result).toEqual({
      "primary-DEFAULT": "hsl(217, 91%, 60%)",
    })
  })

  it("handles empty objects", () => {
    const tokens = {}
    const result = flattenTokens(tokens)
    expect(result).toEqual({})
  })

  it("skips non-string, non-object values", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokens: any = {
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
      },
    }
    const result = flattenTokens(tokens, "typography")
    expect(result["typography-fontSize-xs"]).toBeUndefined()
  })

  it("skips null values", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokens: any = {
      spacing: {
        nullValue: null,
      },
    }
    const result = flattenTokens(tokens, "space")
    expect(result["space-spacing-nullValue"]).toBeUndefined()
  })
})
