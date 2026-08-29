import { describe, it, expect } from "vitest"
import {
  declarationsFor,
  clearDeclarationsCache,
  declarationsForSelectors,
  resolveToken,
  validateTokenExists,
  validateAllTokens,
} from "./index"

describe("utils barrel export", () => {
  describe("declarations exports", () => {
    it("exports declarationsFor", () => {
      expect(declarationsFor).toBeDefined()
      expect(typeof declarationsFor).toBe("function")
    })

    it("exports clearDeclarationsCache", () => {
      expect(clearDeclarationsCache).toBeDefined()
      expect(typeof clearDeclarationsCache).toBe("function")
    })

    it("exports declarationsForSelectors", () => {
      expect(declarationsForSelectors).toBeDefined()
      expect(typeof declarationsForSelectors).toBe("function")
    })

    it("declarations functions work", () => {
      const css = ":root { --color: red; }"
      const result = declarationsFor(css, ":root")
      expect(result.get("--color")).toBe("red")
    })
  })

  describe("resolve exports", () => {
    it("exports resolveToken", () => {
      expect(resolveToken).toBeDefined()
      expect(typeof resolveToken).toBe("function")
    })

    it("exports validateTokenExists", () => {
      expect(validateTokenExists).toBeDefined()
      expect(typeof validateTokenExists).toBe("function")
    })

    it("exports validateAllTokens", () => {
      expect(validateAllTokens).toBeDefined()
      expect(typeof validateAllTokens).toBe("function")
    })

    it("resolve functions work", () => {
      const tokens = new Map([["--color", "#1e293b"]])
      expect(resolveToken("--color", tokens)).toBe("#1e293b")
    })
  })

  describe("integration", () => {
    it("can extract and resolve tokens together", () => {
      const css = `:root {
        --base-color: #1e293b;
        --primary: var(--base-color);
      }`
      const declarations = declarationsFor(css, ":root")
      const resolved = resolveToken("--primary", declarations)
      expect(resolved).toBe("#1e293b")
    })

    it("can extract multiple selectors and resolve all", () => {
      const css = `:root {
        --base: red;
        --light: var(--base);
      }
      .dark {
        --base: blue;
        --dark-color: var(--base);
      }`
      const selectors = declarationsForSelectors(css, ["root", ".dark"])
      const lightResolved = resolveToken("--light", selectors.get("root")!)
      const darkResolved = resolveToken("--dark-color", selectors.get(".dark")!)
      expect(lightResolved).toBe("red")
      expect(darkResolved).toBe("blue")
    })

    it("can validate complex token structures", () => {
      const css = `:root {
        --primary-500: #3b82f6;
        --primary: var(--primary-500);
        --ds-color-primary: var(--primary);
      }`
      const tokens = declarationsFor(css, ":root")
      expect(validateTokenExists("--ds-color-primary", tokens)).toBe(true)
      const resolved = validateAllTokens(tokens)
      expect(resolved.get("--ds-color-primary")).toBe("#3b82f6")
    })
  })
})
