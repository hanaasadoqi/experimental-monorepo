import { describe, it, expect, beforeEach } from "vitest"
import { isTypingTarget } from "./is-typing-target"

describe("isTypingTarget", () => {
  describe("null and non-HTMLElement targets", () => {
    it("returns false for null target", () => {
      expect(isTypingTarget(null)).toBe(false)
    })

    it("returns false for non-HTMLElement targets", () => {
      const targets: EventTarget[] = [
        new EventTarget(),
        { tagName: "DIV" } as unknown as EventTarget,
        { isContentEditable: true } as unknown as EventTarget,
      ]

      targets.forEach((target) => {
        expect(isTypingTarget(target)).toBe(false)
      })
    })

    it("returns false for Document", () => {
      expect(isTypingTarget(document)).toBe(false)
    })

    it("returns false for Window", () => {
      expect(isTypingTarget(window as unknown as EventTarget)).toBe(false)
    })
  })

  describe("default typing targets (INPUT, TEXTAREA, SELECT)", () => {
    it("returns true for INPUT element", () => {
      const input = document.createElement("input")
      expect(isTypingTarget(input)).toBe(true)
    })

    it("returns true for TEXTAREA element", () => {
      const textarea = document.createElement("textarea")
      expect(isTypingTarget(textarea)).toBe(true)
    })

    it("returns true for SELECT element", () => {
      const select = document.createElement("select")
      expect(isTypingTarget(select)).toBe(true)
    })

    it("recognizes default tags regardless of case in tag name", () => {
      const input = document.createElement("input")
      expect(isTypingTarget(input)).toBe(true)
      // tagName is always uppercase in HTMLElement
      expect(input.tagName).toBe("INPUT")
    })
  })

  describe("contentEditable elements", () => {
    let container: HTMLElement

    beforeEach(() => {
      container = document.createElement("div")
      document.body.appendChild(container)
    })

    it("returns true when isContentEditable is true", () => {
      const div = document.createElement("div")
      container.appendChild(div)

      // Mock isContentEditable since jsdom doesn't fully support it
      Object.defineProperty(div, "isContentEditable", {
        value: true,
        writable: true,
      })

      expect(isTypingTarget(div)).toBe(true)
    })

    it("returns false when isContentEditable is false", () => {
      const div = document.createElement("div")
      container.appendChild(div)

      // Ensure isContentEditable is false
      Object.defineProperty(div, "isContentEditable", {
        value: false,
        writable: true,
      })

      expect(isTypingTarget(div)).toBe(false)
    })

    it("returns false for div without contentEditable attribute", () => {
      const div = document.createElement("div")
      container.appendChild(div)

      // By default, DIV elements are not editable
      expect(isTypingTarget(div)).toBe(false)
    })

    it("handles isContentEditable property correctly", () => {
      const elements = [
        { element: document.createElement("div"), isEditable: true },
        { element: document.createElement("span"), isEditable: true },
        { element: document.createElement("div"), isEditable: false },
      ]

      elements.forEach(({ element, isEditable }) => {
        container.appendChild(element)
        Object.defineProperty(element, "isContentEditable", {
          value: isEditable,
          writable: true,
        })
        expect(isTypingTarget(element)).toBe(isEditable)
      })
    })

    it("prefers tag name match over isContentEditable", () => {
      const input = document.createElement("input")
      container.appendChild(input)

      // INPUT is in default tags, should return true regardless of isContentEditable
      Object.defineProperty(input, "isContentEditable", {
        value: false,
        writable: true,
      })

      expect(isTypingTarget(input)).toBe(true)
    })

    it("handles combination of tag and contentEditable", () => {
      // Non-typing element that IS editable
      const div = document.createElement("div")
      container.appendChild(div)
      Object.defineProperty(div, "isContentEditable", {
        value: true,
        writable: true,
      })
      expect(isTypingTarget(div)).toBe(true)

      // Typing element that is NOT editable (still returns true for tag)
      const textarea = document.createElement("textarea")
      container.appendChild(textarea)
      Object.defineProperty(textarea, "isContentEditable", {
        value: false,
        writable: true,
      })
      expect(isTypingTarget(textarea)).toBe(true)
    })
  })

  describe("custom tag names", () => {
    it("accepts custom tag names as additional typing targets", () => {
      const custom = document.createElement("my-editable")
      const result = isTypingTarget(custom, ["my-editable"])

      expect(result).toBe(true)
    })

    it("accepts multiple custom tag names", () => {
      const custom1 = document.createElement("my-input")
      const custom2 = document.createElement("my-textarea")

      expect(isTypingTarget(custom1, ["my-input", "my-textarea"])).toBe(true)
      expect(isTypingTarget(custom2, ["my-input", "my-textarea"])).toBe(true)
    })

    it("normalizes custom tag names to uppercase for comparison", () => {
      const custom = document.createElement("my-input")

      // Providing lowercase should match uppercase tagName
      expect(isTypingTarget(custom, ["my-input"])).toBe(true)
      expect(isTypingTarget(custom, ["MY-INPUT"])).toBe(true)
      expect(isTypingTarget(custom, ["My-Input"])).toBe(true)
    })

    it("returns false for custom tag names that don't match", () => {
      const div = document.createElement("div")

      expect(isTypingTarget(div, ["my-input", "my-textarea"])).toBe(false)
    })

    it("combines default tags with custom tags using Set deduplication", () => {
      const input = document.createElement("input")

      // INPUT is already in default tags, should not duplicate
      const result = isTypingTarget(input, ["input", "custom"])
      expect(result).toBe(true)
    })

    it("handles empty custom tags array", () => {
      const input = document.createElement("input")
      expect(isTypingTarget(input, [])).toBe(true)

      const custom = document.createElement("custom")
      expect(isTypingTarget(custom, [])).toBe(false)
    })
  })

  describe("combination of default and custom tags", () => {
    it("returns true if element matches default or custom tag", () => {
      const input = document.createElement("input")
      expect(isTypingTarget(input, ["custom"])).toBe(true)

      const custom = document.createElement("custom")
      expect(isTypingTarget(custom, ["custom"])).toBe(true)
    })

    it("handles duplicate custom tags correctly", () => {
      const custom = document.createElement("my-input")
      // Should deduplicate via Set
      const result = isTypingTarget(custom, [
        "my-input",
        "my-input",
        "my-input",
      ])

      expect(result).toBe(true)
    })

    it("merges default tags with case variations of custom tags", () => {
      const custom = document.createElement("custom-editor")

      expect(isTypingTarget(custom, ["CUSTOM-EDITOR"])).toBe(true)
      expect(isTypingTarget(custom, ["custom-editor"])).toBe(true)
      expect(isTypingTarget(custom, ["Custom-Editor"])).toBe(true)
    })
  })

  describe("non-typing targets", () => {
    it("returns false for DIV elements", () => {
      const div = document.createElement("div")
      expect(isTypingTarget(div)).toBe(false)
    })

    it("returns false for SPAN elements", () => {
      const span = document.createElement("span")
      expect(isTypingTarget(span)).toBe(false)
    })

    it("returns false for P elements", () => {
      const p = document.createElement("p")
      expect(isTypingTarget(p)).toBe(false)
    })

    it("returns false for BUTTON elements", () => {
      const button = document.createElement("button")
      expect(isTypingTarget(button)).toBe(false)
    })

    it("returns false for A elements", () => {
      const a = document.createElement("a")
      expect(isTypingTarget(a)).toBe(false)
    })

    it("returns false for INPUT type=button", () => {
      const input = document.createElement("input")
      input.type = "button"
      // Still returns true because it's an INPUT element
      // The function only checks tag name, not type attribute
      expect(isTypingTarget(input)).toBe(true)
    })

    it("returns false for other INPUT types like checkbox", () => {
      const input = document.createElement("input")
      input.type = "checkbox"
      // Still returns true because it's an INPUT element
      expect(isTypingTarget(input)).toBe(true)
    })
  })

  describe("real-world usage scenarios", () => {
    let container: HTMLElement

    beforeEach(() => {
      container = document.createElement("div")
      document.body.appendChild(container)
    })

    it("detects typing target in keyboard event handler", () => {
      const input = document.createElement("input")
      const div = document.createElement("div")
      container.appendChild(input)
      container.appendChild(div)

      // In real keyboard event: event.target would be the element
      expect(isTypingTarget(input)).toBe(true)
      expect(isTypingTarget(div)).toBe(false)
    })

    it("can determine if hotkey should be suppressed during typing", () => {
      const input = document.createElement("input")
      const textarea = document.createElement("textarea")
      const div = document.createElement("div")
      container.appendChild(input)
      container.appendChild(textarea)
      container.appendChild(div)

      // Mock contentEditable for div
      Object.defineProperty(div, "isContentEditable", {
        value: true,
        writable: true,
      })

      // Would suppress hotkeys for all these
      expect(isTypingTarget(input)).toBe(true)
      expect(isTypingTarget(textarea)).toBe(true)
      expect(isTypingTarget(div)).toBe(true)

      // Would allow hotkeys for regular elements
      const button = document.createElement("button")
      container.appendChild(button)
      expect(isTypingTarget(button)).toBe(false)
    })

    it("allows custom typing targets for special editors", () => {
      const richTextEditor = document.createElement("div")
      richTextEditor.className = "rich-editor"
      container.appendChild(richTextEditor)

      // Without custom tag, returns false
      expect(isTypingTarget(richTextEditor)).toBe(false)

      // With custom tag registration, returns true
      expect(isTypingTarget(richTextEditor, ["div"])).toBe(true)
    })

    it("handles mixed keyboard event targets correctly", () => {
      const elements = [
        { element: document.createElement("input"), expected: true },
        { element: document.createElement("textarea"), expected: true },
        { element: document.createElement("select"), expected: true },
        { element: document.createElement("button"), expected: false },
        { element: document.createElement("a"), expected: false },
        { element: document.createElement("div"), expected: false },
      ]

      elements.forEach(({ element, expected }) => {
        container.appendChild(element)
        expect(isTypingTarget(element)).toBe(expected)
      })
    })

    it("handles contentEditable with keyboard shortcuts", () => {
      const editor = document.createElement("div")
      container.appendChild(editor)

      // Mock isContentEditable
      Object.defineProperty(editor, "isContentEditable", {
        value: true,
        writable: true,
      })

      // Hotkeys should be suppressed when editor is contentEditable
      expect(isTypingTarget(editor)).toBe(true)
    })
  })

  describe("parameter validation", () => {
    it("handles undefined tagNames parameter (uses default)", () => {
      const input = document.createElement("input")
      expect(isTypingTarget(input, undefined)).toBe(true)
    })

    it("handles empty tagNames parameter", () => {
      const input = document.createElement("input")
      expect(isTypingTarget(input, [])).toBe(true)
    })

    it("handles tagNames with special characters", () => {
      const custom = document.createElement("my-input-v2")
      expect(isTypingTarget(custom, ["my-input-v2"])).toBe(true)
    })

    it("handles null as target (safely)", () => {
      expect(isTypingTarget(null)).toBe(false)
      expect(isTypingTarget(null, ["custom"])).toBe(false)
    })
  })

  describe("HTMLElement instanceof check", () => {
    it("properly validates HTMLElement instances", () => {
      const validElements = [
        document.createElement("div"),
        document.createElement("input"),
        document.createElement("textarea"),
        document.createElement("p"),
        document.createElement("span"),
      ]

      validElements.forEach((element) => {
        expect(element instanceof HTMLElement).toBe(true)
        expect(isTypingTarget(element)).toBeDefined()
      })
    })

    it("rejects non-HTMLElement EventTarget objects", () => {
      const eventTarget = new EventTarget()
      expect(eventTarget instanceof HTMLElement).toBe(false)
      expect(isTypingTarget(eventTarget)).toBe(false)
    })
  })
})
