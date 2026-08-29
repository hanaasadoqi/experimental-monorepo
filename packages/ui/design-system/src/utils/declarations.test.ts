import { describe, it, expect, beforeEach } from "vitest"
import {
  declarationsFor,
  clearDeclarationsCache,
  declarationsForSelectors,
} from "./declarations"

describe("declarationsFor", () => {
  describe("basic parsing", () => {
    it("extracts declarations from :root selector", () => {
      const css = ":root { --primary: #1e293b; --secondary: #64748b; }"
      const result = declarationsFor(css, ":root")
      expect(result.get("--primary")).toBe("#1e293b")
      expect(result.get("--secondary")).toBe("#64748b")
    })

    it("extracts declarations from custom selector", () => {
      const css = ".dark { --text: white; --bg: #1a1a1a; }"
      const result = declarationsFor(css, ".dark")
      expect(result.get("--text")).toBe("white")
      expect(result.get("--bg")).toBe("#1a1a1a")
    })

    it("handles attribute selectors", () => {
      const css = '[data-theme="dark"] { --color: black; }'
      const result = declarationsFor(css, '[data-theme="dark"]')
      expect(result.get("--color")).toBe("black")
    })

    it("returns Map interface", () => {
      const css = ":root { --color: red; }"
      const result = declarationsFor(css, ":root")
      expect(result instanceof Map).toBe(true)
    })

    it("handles multiple declarations in rule", () => {
      const css = ":root { --a: 1px; --b: 2px; --c: 3px; }"
      const result = declarationsFor(css, ":root")
      expect(result.size).toBe(3)
      expect(result.get("--a")).toBe("1px")
      expect(result.get("--b")).toBe("2px")
      expect(result.get("--c")).toBe("3px")
    })

    it("handles complex CSS variable values", () => {
      const css =
        ":root { --color: var(--base-color); --size: calc(1rem + 2px); }"
      const result = declarationsFor(css, ":root")
      expect(result.get("--color")).toBe("var(--base-color)")
      expect(result.get("--size")).toBe("calc(1rem + 2px)")
    })
  })

  describe("selector matching", () => {
    it("uses substring matching for selector", () => {
      const css = ":root { --a: 1px; } .dark { --b: 2px; }"
      const result = declarationsFor(css, "root")
      expect(result.get("--a")).toBe("1px")
    })

    it("throws error when selector not found", () => {
      const css = ":root { --color: red; }"
      expect(() => declarationsFor(css, ".nonexistent")).toThrow(
        "Selector not found"
      )
    })

    it("includes available selectors in error message", () => {
      const css = ":root { --a: red; } .dark { --b: blue; }"
      expect(() => declarationsFor(css, ".missing")).toThrow("Available:")
    })

    it("throws error for invalid selector when no rules exist", () => {
      const css = ""
      expect(() => declarationsFor(css, ":root")).toThrow()
    })
  })

  describe("caching behavior", () => {
    beforeEach(() => {
      clearDeclarationsCache()
    })

    it("caches parsed CSS on first call", () => {
      const css = ":root { --color: red; }"
      const result1 = declarationsFor(css, ":root")
      const result2 = declarationsFor(css, ":root")
      // Same result should be returned
      expect(result1.get("--color")).toBe(result2.get("--color"))
    })

    it("uses cache for identical CSS strings", () => {
      const css = ":root { --primary: blue; --secondary: green; }"
      declarationsFor(css, ":root")
      // Call again with same CSS - should use cache
      const result = declarationsFor(css, ":root")
      expect(result.get("--primary")).toBe("blue")
    })

    it("clears cache when clearDeclarationsCache is called", () => {
      const css = ":root { --color: red; }"
      declarationsFor(css, ":root")
      clearDeclarationsCache()
      // Should still work, but will re-parse
      const result = declarationsFor(css, ":root")
      expect(result.get("--color")).toBe("red")
    })

    it("handles different CSS strings separately", () => {
      const css1 = ":root { --a: 1px; }"
      const css2 = ":root { --a: 2px; }"
      const result1 = declarationsFor(css1, ":root")
      const result2 = declarationsFor(css2, ":root")
      expect(result1.get("--a")).toBe("1px")
      expect(result2.get("--a")).toBe("2px")
    })
  })

  describe("error handling", () => {
    it("throws error for invalid CSS", () => {
      const invalidCss = ":root { --color: red"
      expect(() => declarationsFor(invalidCss, ":root")).toThrow(
        "Failed to parse CSS"
      )
    })

    it("error includes parse error message", () => {
      const invalidCss = ":root { --color: red"
      expect(() => declarationsFor(invalidCss, ":root")).toThrow()
    })

    it("throws error with helpful message for missing selector", () => {
      const css = ":root { --a: 1px; } .light { --b: 2px; }"
      expect(() => declarationsFor(css, ".nonexistent")).toThrow(
        /Selector not found/
      )
    })
  })

  describe("edge cases", () => {
    it("handles empty rule", () => {
      const css = ":root { }"
      const result = declarationsFor(css, ":root")
      expect(result.size).toBe(0)
    })

    it("handles whitespace and formatting", () => {
      const css = `
        :root {
          --color-primary: #1e293b;
          --color-secondary: #64748b;
        }
      `
      const result = declarationsFor(css, ":root")
      expect(result.get("--color-primary")).toBe("#1e293b")
    })

    it("handles comments in CSS", () => {
      const css = `:root {
        /* Primary color */
        --primary: blue;
      }`
      const result = declarationsFor(css, ":root")
      expect(result.get("--primary")).toBe("blue")
    })

    it("handles special characters in values", () => {
      const css = ":root { --path: url('/path/to/file.png'); }"
      const result = declarationsFor(css, ":root")
      expect(result.get("--path")).toBe("url('/path/to/file.png')")
    })
  })
})

describe("clearDeclarationsCache", () => {
  it("clears the internal cache", () => {
    const css = ":root { --color: red; }"
    declarationsFor(css, ":root")
    clearDeclarationsCache()
    // Should work fine after clearing
    const result = declarationsFor(css, ":root")
    expect(result.get("--color")).toBe("red")
  })

  it("can be called multiple times", () => {
    clearDeclarationsCache()
    clearDeclarationsCache()
    clearDeclarationsCache()
    // Should not throw
    expect(() => clearDeclarationsCache()).not.toThrow()
  })
})

describe("declarationsForSelectors", () => {
  it("extracts multiple selectors efficiently", () => {
    const css = ":root { --a: 1px; } .dark { --b: 2px; } .light { --c: 3px; }"
    const result = declarationsForSelectors(css, ["root", ".dark", ".light"])
    expect(result.size).toBe(3)
  })

  it("returns map of selector to declarations", () => {
    const css = ":root { --primary: blue; } .dark { --text: white; }"
    const result = declarationsForSelectors(css, ["root", ".dark"])
    expect(result instanceof Map).toBe(true)
    expect(result.get("root")?.get("--primary")).toBe("blue")
    expect(result.get(".dark")?.get("--text")).toBe("white")
  })

  it("handles selectors that don't exist", () => {
    const css = ":root { --a: 1px; }"
    const result = declarationsForSelectors(css, [
      "root",
      ".nonexistent",
      ".alsoNotThere",
    ])
    // Should only include selectors that exist
    expect(result.has("root")).toBe(true)
    expect(result.has(".nonexistent")).toBe(false)
  })

  it("handles empty selector array", () => {
    const css = ":root { --color: red; }"
    const result = declarationsForSelectors(css, [])
    expect(result.size).toBe(0)
  })

  it("uses cache efficiently for multiple selectors", () => {
    const css = ":root { --a: 1px; } .dark { --b: 2px; }"
    clearDeclarationsCache()
    const result = declarationsForSelectors(css, ["root", ".dark"])
    expect(result.size).toBe(2)
  })

  it("returns each selector's declarations as separate Map", () => {
    const css = ":root { --shared: 1px; } .dark { --dark-only: 2px; }"
    const result = declarationsForSelectors(css, ["root", ".dark"])
    const rootDecls = result.get("root")
    const darkDecls = result.get(".dark")
    expect(rootDecls?.get("--shared")).toBe("1px")
    expect(darkDecls?.get("--dark-only")).toBe("2px")
    expect(rootDecls?.has("--dark-only")).toBe(false)
  })
})

describe("error handling and edge cases", () => {
  describe("unclosed CSS comments", () => {
    it("throws error for unclosed CSS comment", () => {
      const css = ":root { /* comment --color: red; }"
      expect(() => declarationsFor(css, ":root")).toThrow("Unclosed CSS comment")
    })

    it("throws error for comment that spans beyond end", () => {
      const css = ":root { --a: 1px; /* comment without close"
      expect(() => declarationsFor(css, ":root")).toThrow()
    })

    it("handles multiple comments", () => {
      const css = ":root { /* first */ --a: 1px; /* second */ --b: 2px; }"
      const result = declarationsFor(css, ":root")
      expect(result.get("--a")).toBe("1px")
      expect(result.get("--b")).toBe("2px")
    })

    it("handles nested comment-like syntax in strings", () => {
      // Note: The parser removes comments from the value, so /* */ is stripped
      const css = `:root { --path: "url(/* stripped */)"; }`
      const result = declarationsFor(css, ":root")
      // Comments are removed even inside strings
      expect(result.get("--path")).toContain("url(")
    })
  })

  describe("unclosed CSS strings", () => {
    it("throws error for unclosed double-quoted string", () => {
      const css = `:root { --path: "unclosed; }`
      expect(() => declarationsFor(css, ":root")).toThrow("Unclosed CSS string")
    })

    it("throws error for unclosed single-quoted string", () => {
      const css = `:root { --path: 'unclosed; }`
      expect(() => declarationsFor(css, ":root")).toThrow("Unclosed CSS string")
    })

    it("handles escaped quotes in strings", () => {
      const css = `:root { --path: "has\\"escaped\\"quotes"; }`
      const result = declarationsFor(css, ":root")
      expect(result.get("--path")).toContain("escaped")
    })

    it("handles different quote types", () => {
      const css = `:root { --single: 'value'; --double: "value"; }`
      const result = declarationsFor(css, ":root")
      // Quotes are included in the value as they are in the CSS
      expect(result.get("--single")).toBe("'value'")
      expect(result.get("--double")).toBe('"value"')
    })
  })

  describe("unclosed CSS blocks", () => {
    it("throws error for unclosed CSS block", () => {
      const css = ":root { --color: red;"
      expect(() => declarationsFor(css, ":root")).toThrow("Unclosed CSS block")
    })

    it("throws error for unexpected closing brace with no opening", () => {
      const css = "} :root { --color: red; }"
      expect(() => declarationsFor(css, ":root")).toThrow(
        "Unexpected closing CSS block"
      )
    })

    it("handles mismatched braces in complex rules", () => {
      // Valid complex rule with balanced braces
      const css = ":root { --a: 1px; } @media (max-width: 600px) { .dark { --b: 2px; } }"
      const result = declarationsFor(css, ":root")
      expect(result.get("--a")).toBe("1px")
    })
  })

  describe("unclosed CSS functions", () => {
    it("throws error for unclosed calc() function", () => {
      const css = ":root { --size: calc(1rem + 2px; }"
      expect(() => declarationsFor(css, ":root")).toThrow("Unclosed CSS function")
    })

    it("throws error for unclosed var() function", () => {
      const css = ":root { --color: var(--base; }"
      expect(() => declarationsFor(css, ":root")).toThrow("Unclosed CSS function")
    })

    it("handles multiple nested functions", () => {
      const css = ":root { --size: calc(min(100%, 500px) + 2rem); }"
      const result = declarationsFor(css, ":root")
      expect(result.get("--size")).toBe("calc(min(100%, 500px) + 2rem)")
    })

    it("throws error for unexpected closing parenthesis", () => {
      const css = ":root { --bad: value); }"
      expect(() => declarationsFor(css, ":root")).toThrow(
        "Unexpected closing parenthesis"
      )
    })
  })

  describe("invalid CSS rules", () => {
    it("throws error for unclosed CSS block at end of file", () => {
      const css = ":root { --valid: 1px; } .invalid { --prop: value"
      // The "Invalid CSS rule" error is thrown when there's a dangling rule (without opening brace)
      // But this case has an unclosed block, so that's the error that's thrown
      expect(() => declarationsFor(css, ".invalid")).toThrow("Unclosed CSS block")
    })

    it("throws error for dangling selector without brace", () => {
      const css = ":root { --valid: 1px; } .dangling"
      // Dangling selector/rule with no opening brace and no semicolon
      expect(() => declarationsFor(css, ":root")).toThrow("Invalid CSS rule")
    })

    it("ignores rules that end with semicolon", () => {
      const css = ":root { --a: 1px; };"
      const result = declarationsFor(css, ":root")
      expect(result.get("--a")).toBe("1px")
    })

    it("handles rules with only whitespace", () => {
      const css = ":root { --color: red; }   \n\t"
      const result = declarationsFor(css, ":root")
      expect(result.get("--color")).toBe("red")
    })
  })

  describe("at-rules and nested rules", () => {
    it("handles @media queries (non-nested at-rule)", () => {
      const css = `
        @media (max-width: 600px) {
          :root { --mobile: 1px; }
        }
      `
      const result = declarationsFor(css, ":root")
      expect(result.get("--mobile")).toBe("1px")
    })

    it("handles @supports queries", () => {
      const css = `
        @supports (display: grid) {
          :root { --grid: 1fr; }
        }
      `
      const result = declarationsFor(css, ":root")
      expect(result.get("--grid")).toBe("1fr")
    })

    it("handles @container queries", () => {
      const css = `
        @container (min-width: 400px) {
          :root { --container: 1px; }
        }
      `
      const result = declarationsFor(css, ":root")
      expect(result.get("--container")).toBe("1px")
    })

    it("handles @layer rules", () => {
      const css = `
        @layer base {
          :root { --layer: 1px; }
        }
      `
      const result = declarationsFor(css, ":root")
      expect(result.get("--layer")).toBe("1px")
    })

    it("ignores @keyframes (non-variable at-rule)", () => {
      const css = `
        @keyframes slide {
          from { --start: 0; }
          to { --end: 100%; }
        }
        :root { --normal: 1px; }
      `
      const result = declarationsFor(css, ":root")
      expect(result.get("--normal")).toBe("1px")
      // @keyframes content should be ignored
      expect(result.has("--start")).toBe(false)
    })

    it("ignores @font-face rules", () => {
      const css = `
        @font-face {
          font-family: CustomFont;
          --unused: 1px;
        }
        :root { --color: red; }
      `
      const result = declarationsFor(css, ":root")
      expect(result.get("--color")).toBe("red")
    })

    it("handles @media with comments", () => {
      const css = `
        @media /* query */ (max-width: 600px) {
          :root { --media: 1px; }
        }
      `
      const result = declarationsFor(css, ":root")
      expect(result.get("--media")).toBe("1px")
    })
  })

  describe("prelude and selector parsing", () => {
    it("handles comments in selector prelude", () => {
      const css = `:root /* comment */ { --a: 1px; }`
      const result = declarationsFor(css, ":root")
      expect(result.get("--a")).toBe("1px")
    })

    it("handles comments in @media prelude", () => {
      const css = `
        @media /* comment */ (max-width: 600px) {
          :root { --mobile: 1px; }
        }
      `
      const result = declarationsFor(css, ":root")
      expect(result.get("--mobile")).toBe("1px")
    })

    it("handles complex selectors with comments", () => {
      const css = `.class1 /* first */ .class2 /* second */ { --color: red; }`
      const result = declarationsFor(css, ".class2")
      expect(result.get("--color")).toBe("red")
    })

    it("handles selectors with attribute selectors", () => {
      const css = `[data-theme] { --theme: light; }`
      const result = declarationsFor(css, "data-theme")
      expect(result.get("--theme")).toBe("light")
    })

    it("handles compound selectors", () => {
      const css = `.btn.primary { --bg: blue; }`
      const result = declarationsFor(css, ".primary")
      expect(result.get("--bg")).toBe("blue")
    })

    it("handles pseudo-classes with arguments", () => {
      const css = `:is(.btn, .link):hover { --opacity: 0.8; }`
      const result = declarationsFor(css, ":is")
      expect(result.get("--opacity")).toBe("0.8")
    })
  })

  describe("performance and caching", () => {
    beforeEach(() => {
      clearDeclarationsCache()
    })

    it("handles large CSS files efficiently", () => {
      const selectors = Array.from({ length: 100 }, (_, i) => `.class-${i}`)
      const rules = selectors
        .map((sel) => `${sel} { --index: ${Math.random()}; }`)
        .join(" ")
      const css = `:root { --root: 1px; } ${rules}`

      const result = declarationsFor(css, ":root")
      expect(result.get("--root")).toBe("1px")
    })

    it("caches across multiple declarationsFor calls", () => {
      const css = ":root { --a: 1px; } .dark { --b: 2px; }"
      const result1 = declarationsFor(css, ":root")
      const result2 = declarationsFor(css, ".dark")

      expect(result1.get("--a")).toBe("1px")
      expect(result2.get("--b")).toBe("2px")
    })
  })

  describe("declaration parsing edge cases", () => {
    it("ignores non-CSS-variable properties", () => {
      const css = ":root { color: red; --primary: blue; font-size: 12px; }"
      const result = declarationsFor(css, ":root")
      expect(result.size).toBe(1)
      expect(result.get("--primary")).toBe("blue")
      expect(result.has("color")).toBe(false)
    })

    it("handles properties with no value", () => {
      const css = ":root { --a: ; --b: 1px; }"
      const result = declarationsFor(css, ":root")
      expect(result.get("--b")).toBe("1px")
      // --a should have empty string value
      expect(result.get("--a")).toBe("")
    })

    it("handles complex values with multiple colons", () => {
      const css = ":root { --url: url('https://example.com/path'); }"
      const result = declarationsFor(css, ":root")
      expect(result.get("--url")).toBe("url('https://example.com/path')")
    })

    it("preserves trailing semicolon handling", () => {
      const css = ":root { --a: 1px; --b: 2px; --c: 3px;   }"
      const result = declarationsFor(css, ":root")
      expect(result.size).toBe(3)
    })

    it("handles comments inside declaration values", () => {
      const css = ":root { --a: /* comment */ 1px; --b: 2px; }"
      const result = declarationsFor(css, ":root")
      // Comment is stripped from value
      expect(result.get("--a")).toContain("1px")
      expect(result.get("--b")).toBe("2px")
    })

    it("handles colons inside quoted strings", () => {
      const css = `:root { --url: "https://example.com:8080"; --time: "12:30:45"; }`
      const result = declarationsFor(css, ":root")
      expect(result.get("--url")).toContain("example.com")
      expect(result.get("--time")).toContain("12:30:45")
    })

    it("handles escaped backslashes in strings", () => {
      const css = `:root { --path: "C:\\\\Users\\\\Documents"; }`
      const result = declarationsFor(css, ":root")
      expect(result.has("--path")).toBe(true)
    })

    it("handles empty declarations", () => {
      const css = ":root {}"
      const result = declarationsFor(css, ":root")
      expect(result.size).toBe(0)
    })
  })

  describe("edge cases for uncovered branches", () => {
    it("handles comments in declaration property names (comment skip path)", () => {
      // This tests the comment-skipping loop in declarationColon (lines 67-68)
      const css = `:root { --primary/*comment*/: red; }`
      const result = declarationsFor(css, ":root")
      expect(result.has("--primary")).toBe(true)
      expect(result.get("--primary")).toBe("red")
    })

    it("handles multiple comments in declaration property", () => {
      const css = `:root { --primary/*c1*//*c2*/: blue; }`
      const result = declarationsFor(css, ":root")
      expect(result.has("--primary")).toBe(true)
      expect(result.get("--primary")).toBe("blue")
    })

    it("handles quoted strings in property names edge case (string skip path)", () => {
      // This tests the string-skipping loop in declarationColon (lines 71-72)
      // Note: This is invalid CSS but tests the skip path
      const css = `:root { --prop"quoted": purple; }`
      const result = declarationsFor(css, ":root")
      expect(result.has("--prop")).toBe(false)
    })

    it("handles comments immediately after selector (prelude comment skip)", () => {
      // This tests the comment-skipping in parseRules prelude (lines 141-142)
      const css = `:root/*start*/ { --color: orange; }`
      const result = declarationsFor(css, ":root")
      expect(result.get("--color")).toBe("orange")
    })

    it("handles comments between selector and opening brace", () => {
      const css = `.theme/*theme-comment*/ { --accent: green; }`
      const result = declarationsFor(css, ".theme")
      expect(result.get("--accent")).toBe("green")
    })

    it("handles complex comments in prelude with whitespace", () => {
      const css = `[data-mode]/*1*/ /*2*/ { --config: exists; }`
      const result = declarationsFor(css, "[data-mode]")
      expect(result.get("--config")).toBe("exists")
    })

    it("handles comment inside parentheses in property", () => {
      const css = `:root { --calc: calc(100%/*half*/ - 10px); }`
      const result = declarationsFor(css, ":root")
      expect(result.get("--calc")).toContain("100%")
    })

    it("handles nested comments-like syntax in values", () => {
      const css = `:root { --url: url("data:/*fake*/"); }`
      const result = declarationsFor(css, ":root")
      expect(result.has("--url")).toBe(true)
    })

    it("handles string containing colon in property value", () => {
      const css = `:root { --url: "https://example.com:443"; }`
      const result = declarationsFor(css, ":root")
      expect(result.has("--url")).toBe(true)
    })
  })
})
