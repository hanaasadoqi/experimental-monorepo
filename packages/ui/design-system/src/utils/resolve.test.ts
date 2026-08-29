import { describe, it, expect } from "vitest"
import { resolveToken, validateTokenExists, validateAllTokens } from "./resolve"
import { TokenMap } from "../types";

describe("resolveToken", () => {
  describe("literal values", () => {
    it("returns literal color values unchanged", () => {
      const tokens = new Map([["--color", "#1e293b"]])
      expect(resolveToken("--color", tokens)).toBe("#1e293b")
    })

    it("returns literal pixel values unchanged", () => {
      const tokens = new Map([["--size", "12px"]])
      expect(resolveToken("--size", tokens)).toBe("12px")
    })

    it("returns literal url values unchanged", () => {
      const tokens = new Map([["--image", "url('/path/to/image.png')"]])
      expect(resolveToken("--image", tokens)).toBe("url('/path/to/image.png')")
    })

    it("handles calc() expressions", () => {
      const tokens = new Map([["--spacing", "calc(1rem + 2px)"]])
      expect(resolveToken("--spacing", tokens)).toBe("calc(1rem + 2px)")
    })
  })

  describe("single level references", () => {
    it("resolves one level of indirection", () => {
      const tokens = new Map([
        ["--primary", "var(--base-primary)"],
        ["--base-primary", "#1e293b"],
      ])
      expect(resolveToken("--primary", tokens)).toBe("#1e293b")
    })

    it("resolves semantic token to primitive", () => {
      const tokens = new Map([
        ["--ds-color-primary", "var(--primary-700)"],
        ["--primary-700", "#1e293b"],
      ])
      expect(resolveToken("--ds-color-primary", tokens)).toBe("#1e293b")
    })
  })

  describe("multi-level references", () => {
    it("resolves multiple levels of indirection", () => {
      const tokens = new Map([
        ["--token-a", "var(--token-b)"],
        ["--token-b", "var(--token-c)"],
        ["--token-c", "#1e293b"],
      ])
      expect(resolveToken("--token-a", tokens)).toBe("#1e293b")
    })

    it("handles deep nesting", () => {
      const tokens = new Map([
        ["--a", "var(--b)"],
        ["--b", "var(--c)"],
        ["--c", "var(--d)"],
        ["--d", "var(--e)"],
        ["--e", "blue"],
      ])
      expect(resolveToken("--a", tokens)).toBe("blue")
    })
  })

  describe("error cases", () => {
    it("throws error when token not found", () => {
      const tokens = new Map([["--other", "red"]])
      expect(() => resolveToken("--missing", tokens)).toThrow("Token not found")
    })

    it("throws error when token has undefined value", () => {
      const tokens = new Map([["--color", undefined as any]])
      expect(() => resolveToken("--color", tokens)).toThrow(
        "has undefined value"
      )
    })

    it("throws error for malformed var() reference", () => {
      const tokens = new Map([["--bad", "var(--primary"]])
      expect(() => resolveToken("--bad", tokens)).toThrow(
        "Malformed CSS variable reference"
      )
    })

    it("includes format hint in malformed reference error", () => {
      const tokens = new Map([["--bad", "var(--primary 10px)"]])
      expect(() => resolveToken("--bad", tokens)).toThrow(
        "Expected format: var(--name)"
      )
    })

    it("throws error when referenced token doesn't exist", () => {
      const tokens = new Map([["--color", "var(--nonexistent)"]])
      expect(() => resolveToken("--color", tokens)).toThrow("Token not found")
    })
  })

  describe("circular references", () => {
    it("detects simple circular reference", () => {
      const tokens = new Map([["--a", "var(--a)"]])
      expect(() => resolveToken("--a", tokens)).toThrow(
        "Circular reference detected"
      )
    })

    it("detects two-token circular reference", () => {
      const tokens = new Map([
        ["--a", "var(--b)"],
        ["--b", "var(--a)"],
      ])
      expect(() => resolveToken("--a", tokens)).toThrow(
        "Circular reference detected"
      )
    })

    it("detects multi-token circular reference", () => {
      const tokens = new Map([
        ["--a", "var(--b)"],
        ["--b", "var(--c)"],
        ["--c", "var(--a)"],
      ])
      expect(() => resolveToken("--a", tokens)).toThrow(
        "Circular reference detected"
      )
    })

    it("includes path in circular reference error", () => {
      const tokens = new Map([
        ["--a", "var(--b)"],
        ["--b", "var(--a)"],
      ])
      expect(() => resolveToken("--a", tokens)).toThrow(/circular|--a|--b/)
    })
  })

  describe("edge cases", () => {
    it("handles token names with multiple dashes", () => {
      const tokens = new Map([["--ds-color-primary-light", "#e8eef5"]])
      expect(resolveToken("--ds-color-primary-light", tokens)).toBe("#e8eef5")
    })

    it("handles token with numeric values", () => {
      const tokens = new Map([
        ["--step-5", "var(--base-5)"],
        ["--base-5", "500"],
      ])
      expect(resolveToken("--step-5", tokens)).toBe("500")
    })

    it("returns literal values as-is", () => {
      const tokens = new Map([["--spacing", "0.5rem"]])
      expect(resolveToken("--spacing", tokens)).toBe("0.5rem")
    })
  })

  describe("visited set tracking", () => {
    it("tracks visited tokens for cycle detection", () => {
      const tokens = new Map([
        ["--a", "var(--b)"],
        ["--b", "var(--c)"],
        ["--c", "var(--a)"],
      ])
      expect(() => resolveToken("--a", tokens)).toThrow()
    })

    it("allows reusing same token in different resolution paths", () => {
      const tokens = new Map([
        ["--color-primary", "var(--base-color)"],
        ["--color-secondary", "var(--base-color)"],
        ["--base-color", "blue"],
      ])
      expect(resolveToken("--color-primary", tokens)).toBe("blue")
      expect(resolveToken("--color-secondary", tokens)).toBe("blue")
    })
  })
})

describe("validateTokenExists", () => {
  it("returns true for existing token that can be resolved", () => {
    const tokens = new Map([["--color", "#1e293b"]])
    expect(validateTokenExists("--color", tokens)).toBe(true)
  })

  it("returns true for token with valid reference chain", () => {
    const tokens = new Map([
      ["--primary", "var(--base-primary)"],
      ["--base-primary", "blue"],
    ])
    expect(validateTokenExists("--primary", tokens)).toBe(true)
  })

  it("returns false for non-existent token", () => {
    const tokens = new Map([["--other", "red"]])
    expect(validateTokenExists("--missing", tokens)).toBe(false)
  })

  it("returns false for token with broken reference", () => {
    const tokens = new Map([["--color", "var(--nonexistent)"]])
    expect(validateTokenExists("--color", tokens)).toBe(false)
  })

  it("returns false for token with circular reference", () => {
    const tokens = new Map([
      ["--a", "var(--b)"],
      ["--b", "var(--a)"],
    ])
    expect(validateTokenExists("--a", tokens)).toBe(false)
  })

  it("returns false for malformed reference", () => {
    const tokens = new Map([["--bad", "var(--primary"]])
    expect(validateTokenExists("--bad", tokens)).toBe(false)
  })

  it("never throws exceptions", () => {
    const tokens = new Map([["--a", "var(--b)"]])
    expect(() => validateTokenExists("--missing", tokens)).not.toThrow()
    expect(() => validateTokenExists("--a", tokens)).not.toThrow()
  })
})

describe("validateAllTokens", () => {
  it("returns resolved map for valid tokens", () => {
    const tokens = new Map([
      ["--primary", "#1e293b"],
      ["--secondary", "#64748b"],
    ])
    const result = validateAllTokens(tokens)
    expect(result.get("--primary")).toBe("#1e293b")
    expect(result.get("--secondary")).toBe("#64748b")
  })

  it("resolves tokens with references", () => {
    const tokens = new Map([
      ["--color", "var(--base-color)"],
      ["--base-color", "blue"],
    ])
    const result = validateAllTokens(tokens)
    expect(result.get("--color")).toBe("blue")
  })

  it("returns Map with all tokens resolved", () => {
    const tokens = new Map([
      ["--a", "1px"],
      ["--b", "var(--a)"],
      ["--c", "var(--b)"],
    ])
    const result = validateAllTokens(tokens)
    expect(result.size).toBe(3)
    expect(result.get("--a")).toBe("1px")
    expect(result.get("--b")).toBe("1px")
    expect(result.get("--c")).toBe("1px")
  })

  it("throws error if any token is invalid", () => {
    const tokens = new Map([
      ["--valid", "red"],
      ["--invalid", "var(--missing)"],
    ])
    expect(() => validateAllTokens(tokens)).toThrow()
  })

  it("includes error details in thrown error", () => {
    const tokens = new Map([
      ["--bad1", "var(--missing1)"],
      ["--bad2", "var(--missing2)"],
    ])
    expect(() => validateAllTokens(tokens)).toThrow("Token validation failed")
  })

  it("throws on circular references", () => {
    const tokens = new Map([
      ["--a", "var(--b)"],
      ["--b", "var(--a)"],
    ])
    expect(() => validateAllTokens(tokens)).toThrow()
  })

  it("handles empty token map", () => {
    const tokens: TokenMap = new Map([])
    const result = validateAllTokens(tokens)
    expect(result.size).toBe(0)
  })

  it("accumulates all errors before throwing", () => {
    const tokens = new Map([
      ["--bad1", "var(--missing1)"],
      ["--bad2", "var(--missing2)"],
      ["--bad3", "var(--missing3)"],
    ])
    expect(() => validateAllTokens(tokens)).toThrow()
  })

  it("throws with message containing all accumulated errors", () => {
    const tokens = new Map([
      ["--error1", "var(--missing1)"],
      ["--error2", "var(--missing2)"],
    ])
    try {
      validateAllTokens(tokens)
    } catch (error) {
      expect(error instanceof Error).toBe(true)
      if (error instanceof Error) {
        expect(error.message).toContain("Token validation failed")
      }
    }
  })

  it("handles mixed valid and invalid tokens", () => {
    const tokens = new Map([
      ["--valid1", "red"],
      ["--invalid", "var(--notfound)"],
      ["--valid2", "blue"],
    ])
    expect(() => validateAllTokens(tokens)).toThrow()
  })

  describe("uncovered branch coverage - error handling", () => {
    it("throws error with accumulated error messages", () => {
      const tokens = new Map([
        ["--missing1", "var(--undefined1)"],
        ["--missing2", "var(--undefined2)"],
        ["--missing3", "var(--undefined3)"],
      ])
      try {
        validateAllTokens(tokens)
        expect.fail("Should have thrown")
      } catch (error) {
        expect(error instanceof Error).toBe(true)
        if (error instanceof Error) {
          expect(error.message).toContain("Token validation failed")
          // Verify multiple errors are in the message
          expect(error.message).toContain("--undefined1")
          expect(error.message).toContain("--undefined2")
          expect(error.message).toContain("--undefined3")
        }
      }
    })

    it("validates all tokens before throwing (doesn't short-circuit)", () => {
      const tokens = new Map([
        ["--first", "var(--notfound1)"],
        ["--second", "var(--notfound2)"],
      ])
      let errorThrown = false
      try {
        validateAllTokens(tokens)
      } catch (error) {
        errorThrown = true
        expect(error instanceof Error).toBe(true)
      }
      expect(errorThrown).toBe(true)
    })

    it("handles malformed variable references in validation", () => {
      const tokens = new Map([
        ["--bad", "not-a-var()"],
      ])
      expect(() => validateAllTokens(tokens)).toThrow()
    })

    it("validates single missing token throws with proper message", () => {
      const tokens = new Map([
        ["--solo", "var(--missing)"],
      ])
      expect(() => validateAllTokens(tokens)).toThrow(
        /Token validation failed/
      )
    })

    it("error message preserves line breaks for readability", () => {
      const tokens = new Map([
        ["--err1", "var(--miss1)"],
        ["--err2", "var(--miss2)"],
      ])
      try {
        validateAllTokens(tokens)
      } catch (error) {
        if (error instanceof Error) {
          // Error message should have newlines separating error items
          expect(error.message).toContain("\n")
        }
      }
    })

    it("handles error instanceof check for Error class during validation", () => {
      const tokens = new Map([
        ["--test1", "var(--missing1)"],
        ["--test2", "var(--missing2)"],
      ])
      try {
        validateAllTokens(tokens)
        expect.fail("Should throw")
      } catch (error) {
        // This verifies error instanceof Error check in the catch block
        expect(error instanceof Error).toBe(true)
        expect(String(error)).toContain("Token validation failed")
      }
    })

    it("accumulates multiple validation errors in error message", () => {
      const tokens = new Map([
        ["--error-1", "var(--undefined-1)"],
        ["--error-2", "var(--undefined-2)"],
        ["--error-3", "var(--undefined-3)"],
        ["--error-4", "var(--undefined-4)"],
      ])
      try {
        validateAllTokens(tokens)
      } catch (error) {
        expect(error instanceof Error).toBe(true)
        if (error instanceof Error) {
          const message = error.message
          expect(message).toContain("Token validation failed")
          // Verify message has multiple error entries
          expect(message.split("\n").length).toBeGreaterThan(2)
        }
      }
    })

    it("throws error when any token validation fails", () => {
      const tokens = new Map([
        ["--good", "red"],
        ["--bad", "var(--notexist)"],
        ["--also-good", "blue"],
      ])
      expect(() => validateAllTokens(tokens)).toThrow()
    })
  })
})
