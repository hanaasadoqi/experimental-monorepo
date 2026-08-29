import { describe, expect, it, beforeEach, afterEach, vi } from "vitest"

import { applyToHtml } from "./apply-to-html"

describe("applyToHtml", () => {
  let mockElement: HTMLElement
  let mockSetProperty: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockSetProperty = vi.fn()
    mockElement = {
      style: {
        setProperty: mockSetProperty,
      },
    } as unknown as HTMLElement
  })

  describe("with ref to specific element", () => {
    it("applies single CSS variable to provided element", () => {
      const ref = { current: mockElement }
      const variables = { primary: "hsl(217, 91%, 60%)" }

      applyToHtml(variables, ref)

      expect(mockSetProperty).toHaveBeenCalledWith(
        "--primary",
        "hsl(217, 91%, 60%)"
      )
      expect(mockSetProperty).toHaveBeenCalledTimes(1)
    })

    it("applies multiple CSS variables to provided element", () => {
      const ref = { current: mockElement }
      const variables = {
        primary: "hsl(217, 91%, 60%)",
        secondary: "hsl(217, 32%, 17%)",
        destructive: "hsl(0, 84%, 60%)",
      }

      applyToHtml(variables, ref)

      expect(mockSetProperty).toHaveBeenCalledWith(
        "--primary",
        "hsl(217, 91%, 60%)"
      )
      expect(mockSetProperty).toHaveBeenCalledWith(
        "--secondary",
        "hsl(217, 32%, 17%)"
      )
      expect(mockSetProperty).toHaveBeenCalledWith(
        "--destructive",
        "hsl(0, 84%, 60%)"
      )
      expect(mockSetProperty).toHaveBeenCalledTimes(3)
    })

    it("applies CSS variables with various value formats", () => {
      const ref = { current: mockElement }
      const variables = {
        color: "rgb(51, 176, 255)",
        spacing: "1rem",
        shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      }

      applyToHtml(variables, ref)

      expect(mockSetProperty).toHaveBeenCalledWith(
        "--color",
        "rgb(51, 176, 255)"
      )
      expect(mockSetProperty).toHaveBeenCalledWith("--spacing", "1rem")
      expect(mockSetProperty).toHaveBeenCalledWith(
        "--shadow",
        "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
      )
    })

    it("handles empty variables object", () => {
      const ref = { current: mockElement }
      const variables = {}

      applyToHtml(variables, ref)

      expect(mockSetProperty).not.toHaveBeenCalled()
    })

    it("overwrites existing CSS variables", () => {
      const ref = { current: mockElement }
      const variables1 = { primary: "hsl(217, 91%, 60%)" }
      const variables2 = { primary: "hsl(0, 84%, 60%)" }

      applyToHtml(variables1, ref)
      applyToHtml(variables2, ref)

      expect(mockSetProperty).toHaveBeenNthCalledWith(
        1,
        "--primary",
        "hsl(217, 91%, 60%)"
      )
      expect(mockSetProperty).toHaveBeenNthCalledWith(
        2,
        "--primary",
        "hsl(0, 84%, 60%)"
      )
    })

    it("preserves other CSS variables when applying new ones", () => {
      const ref = { current: mockElement }
      const variables1 = { primary: "hsl(217, 91%, 60%)" }
      const variables2 = { secondary: "hsl(217, 32%, 17%)" }

      applyToHtml(variables1, ref)
      applyToHtml(variables2, ref)

      expect(mockSetProperty).toHaveBeenCalledWith(
        "--primary",
        "hsl(217, 91%, 60%)"
      )
      expect(mockSetProperty).toHaveBeenCalledWith(
        "--secondary",
        "hsl(217, 32%, 17%)"
      )
      expect(mockSetProperty).toHaveBeenCalledTimes(2)
    })

    it("applies variables with special characters in values", () => {
      const ref = { current: mockElement }
      const variables = {
        gradient: "linear-gradient(to right, #ff0000, #0000ff)",
        calc: "calc(100% - 10px)",
      }

      applyToHtml(variables, ref)

      expect(mockSetProperty).toHaveBeenCalledWith(
        "--gradient",
        "linear-gradient(to right, #ff0000, #0000ff)"
      )
      expect(mockSetProperty).toHaveBeenCalledWith(
        "--calc",
        "calc(100% - 10px)"
      )
    })
  })

  describe("without ref (document.documentElement)", () => {
    let originalDocumentElement: HTMLElement

    beforeEach(() => {
      originalDocumentElement = document.documentElement
      const mockDocumentElement = mockElement
      Object.defineProperty(document, "documentElement", {
        value: mockDocumentElement,
        writable: true,
      })
    })

    afterEach(() => {
      Object.defineProperty(document, "documentElement", {
        value: originalDocumentElement,
        writable: true,
      })
    })

    it("applies variables to document.documentElement when ref is null", () => {
      const variables = { primary: "hsl(217, 91%, 60%)" }

      applyToHtml(variables)

      expect(mockSetProperty).toHaveBeenCalledWith(
        "--primary",
        "hsl(217, 91%, 60%)"
      )
    })

    it("applies variables to document.documentElement when ref is undefined", () => {
      const variables = { primary: "hsl(217, 91%, 60%)" }

      applyToHtml(variables)

      expect(mockSetProperty).toHaveBeenCalledWith(
        "--primary",
        "hsl(217, 91%, 60%)"
      )
    })

    it("applies multiple variables to document.documentElement", () => {
      const variables = {
        primary: "hsl(217, 91%, 60%)",
        secondary: "hsl(217, 32%, 17%)",
      }

      applyToHtml(variables)

      expect(mockSetProperty).toHaveBeenCalledWith(
        "--primary",
        "hsl(217, 91%, 60%)"
      )
      expect(mockSetProperty).toHaveBeenCalledWith(
        "--secondary",
        "hsl(217, 32%, 17%)"
      )
      expect(mockSetProperty).toHaveBeenCalledTimes(2)
    })
  })

  describe("ref edge cases", () => {
    it("handles ref with current element set", () => {
      const ref = { current: mockElement }
      const variables = { test: "value" }

      applyToHtml(variables, ref)

      expect(mockSetProperty).toHaveBeenCalledWith("--test", "value")
    })
  })

  describe("variable naming", () => {
    it("prefixes variable names with --", () => {
      const ref = { current: mockElement }
      const variables = { myVariable: "value" }

      applyToHtml(variables, ref)

      expect(mockSetProperty).toHaveBeenCalledWith("--myVariable", "value")
    })

    it("handles variable names with hyphens", () => {
      const ref = { current: mockElement }
      const variables = { "my-variable": "value" }

      applyToHtml(variables, ref)

      expect(mockSetProperty).toHaveBeenCalledWith("--my-variable", "value")
    })

    it("handles variable names with numbers", () => {
      const ref = { current: mockElement }
      const variables = { color1: "red", color2: "blue" }

      applyToHtml(variables, ref)

      expect(mockSetProperty).toHaveBeenCalledWith("--color1", "red")
      expect(mockSetProperty).toHaveBeenCalledWith("--color2", "blue")
    })
  })

  describe("value handling", () => {
    it("applies empty string values", () => {
      const ref = { current: mockElement }
      const variables = { empty: "" }

      applyToHtml(variables, ref)

      expect(mockSetProperty).toHaveBeenCalledWith("--empty", "")
    })

    it("applies values with spaces", () => {
      const ref = { current: mockElement }
      const variables = { spaced: "value with spaces" }

      applyToHtml(variables, ref)

      expect(mockSetProperty).toHaveBeenCalledWith(
        "--spaced",
        "value with spaces"
      )
    })

    it("applies whitespace-only values", () => {
      const ref = { current: mockElement }
      const variables = { whitespace: "   " }

      applyToHtml(variables, ref)

      expect(mockSetProperty).toHaveBeenCalledWith("--whitespace", "   ")
    })
  })

  describe("element interaction", () => {
    it("uses setProperty method on element style", () => {
      const ref = { current: mockElement }
      const variables = { test: "value" }

      applyToHtml(variables, ref)

      expect(mockElement.style.setProperty).toHaveBeenCalled()
    })

    it("iterates over all provided variables", () => {
      const ref = { current: mockElement }
      const variables = {
        var1: "value1",
        var2: "value2",
        var3: "value3",
        var4: "value4",
        var5: "value5",
      }

      applyToHtml(variables, ref)

      expect(mockSetProperty).toHaveBeenCalledTimes(5)
    })
  })
})
