import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Input } from "./input"

let container: HTMLElement | undefined

afterEach(() => {
  container?.remove()
  container = undefined
})

describe("Input", () => {
  describe("basic rendering", () => {
    it("renders as an input element", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input />))

      const input = container.querySelector("input")
      expect(input).toBeTruthy()
    })

    it("applies base styling classes", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input />))

      const input = container.querySelector("input")
      expect(input?.className).toContain("h-7")
      expect(input?.className).toContain("w-full")
      expect(input?.className).toContain("rounded-md")
      expect(input?.className).toContain("border")
    })

    it("sets data-slot attribute to 'input'", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input />))

      const input = container.querySelector("input")
      expect(input?.dataset.slot).toBe("input")
    })
  })

  describe("input types", () => {
    it("renders text input by default", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input />))

      const input = container.querySelector("input") as HTMLInputElement
      expect(input?.type).toBe("text")
    })

    it("renders email input when type is email", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input type="email" />))

      const input = container.querySelector("input") as HTMLInputElement
      expect(input?.type).toBe("email")
    })

    it("renders password input when type is password", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input type="password" />))

      const input = container.querySelector("input") as HTMLInputElement
      expect(input?.type).toBe("password")
    })

    it("renders number input when type is number", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input type="number" />))

      const input = container.querySelector("input") as HTMLInputElement
      expect(input?.type).toBe("number")
    })

    it("renders file input when type is file", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input type="file" />))

      const input = container.querySelector("input") as HTMLInputElement
      expect(input?.type).toBe("file")
    })
  })

  describe("props handling", () => {
    it("forwards native input properties", () => {
      container = document.createElement("div")
      document.body.append(container)

      act(() =>
        createRoot(container!).render(
          <Input
            aria-label="Email"
            className="custom-input"
            disabled
            name="email"
            type="email"
          />
        )
      )

      const input = container.querySelector("input")
      expect(input?.getAttribute("aria-label")).toBe("Email")
      expect(input?.name).toBe("email")
      expect(input?.type).toBe("email")
      expect(input?.disabled).toBe(true)
      expect(input?.dataset.slot).toBe("input")
      expect(input?.classList.contains("custom-input")).toBe(true)
    })

    it("merges custom className with base styles", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input className="custom-class" />))

      const input = container.querySelector("input")
      expect(input?.className).toContain("h-7")
      expect(input?.className).toContain("custom-class")
    })

    it("supports placeholder attribute", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input placeholder="Enter email" />))

      const input = container.querySelector("input") as HTMLInputElement
      expect(input?.placeholder).toBe("Enter email")
    })

    it("supports maxLength constraint", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input maxLength={50} />))

      const input = container.querySelector("input") as HTMLInputElement
      expect(input?.maxLength).toBe(50)
    })

    it("reports user input through onChange", () => {
      const onChange = vi.fn()
      container = document.createElement("div")
      document.body.append(container)

      act(() => createRoot(container!).render(<Input onChange={onChange} />))

      const input = container.querySelector("input")!
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )!.set!

      act(() => {
        nativeInputValueSetter.call(input, "hello@example.com")
        input.dispatchEvent(new Event("input", { bubbles: true }))
      })

      expect(onChange).toHaveBeenCalledOnce()
      expect(onChange.mock.calls[0]?.[0].target.value).toBe("hello@example.com")
    })

    it("handles focus event", () => {
      const onFocus = vi.fn()
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input onFocus={onFocus} />))

      const input = container.querySelector("input") as HTMLInputElement
      act(() => {
        input?.focus()
      })
      expect(onFocus).toHaveBeenCalled()
    })

    it("handles blur event", () => {
      const onBlur = vi.fn()
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input onBlur={onBlur} />))

      const input = container.querySelector("input") as HTMLInputElement
      act(() => {
        input?.focus()
        input?.blur()
      })
      expect(onBlur).toHaveBeenCalled()
    })
  })

  describe("styling variants", () => {
    it("applies transition-colors class for smooth state changes", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input />))

      const input = container.querySelector("input")
      expect(input?.className).toContain("transition-colors")
    })

    it("applies focus-visible styles for keyboard navigation", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input />))

      const input = container.querySelector("input")
      expect(input?.className).toContain("focus-visible:border-ring")
      expect(input?.className).toContain("focus-visible:ring-2")
    })

    it("applies disabled state styles", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input disabled />))

      const input = container.querySelector("input")
      expect(input?.className).toContain("disabled:pointer-events-none")
      expect(input?.className).toContain("disabled:opacity-50")
    })

    it("applies aria-invalid styles for error state", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input aria-invalid />))

      const input = container.querySelector("input")
      expect(input?.className).toContain("aria-invalid:border-destructive")
    })

    it("applies dark mode styles", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input />))

      const input = container.querySelector("input")
      expect(input?.className).toContain("dark:bg-input/30")
    })

    it("applies placeholder text color", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input />))

      const input = container.querySelector("input")
      expect(input?.className).toContain("placeholder:text-muted-foreground")
    })
  })

  describe("file input specific", () => {
    it("applies file-specific styling", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input type="file" />))

      const input = container.querySelector("input")
      expect(input?.className).toContain("file:inline-flex")
      expect(input?.className).toContain("file:bg-transparent")
    })
  })

  describe("a11y", () => {
    it("supports aria-label", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input aria-label="search" />))

      const input = container.querySelector("input")
      expect(input?.getAttribute("aria-label")).toBe("search")
    })

    it("supports aria-describedby", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() =>
        createRoot(container!).render(<Input aria-describedby="help-text" />)
      )

      const input = container.querySelector("input")
      expect(input?.getAttribute("aria-describedby")).toBe("help-text")
    })

    it("supports aria-invalid for error states", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input aria-invalid />))

      const input = container.querySelector("input")
      expect(input?.getAttribute("aria-invalid")).toBeTruthy()
    })

    it("is focusable", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() => createRoot(container!).render(<Input />))

      const input = container.querySelector("input") as HTMLInputElement
      expect(input?.tabIndex).toBeGreaterThanOrEqual(-1)
    })
  })

  describe("composition", () => {
    it("works with label elements", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() =>
        createRoot(container!).render(
          <div>
            <label htmlFor="test-input">Username</label>
            <Input id="test-input" />
          </div>
        )
      )

      const label = container.querySelector("label")
      const input = container.querySelector("input") as HTMLInputElement
      expect(label?.htmlFor).toBe("test-input")
      expect(input?.id).toBe("test-input")
    })

    it("works in a form context", () => {
      container = document.createElement("div")
      document.body.append(container)
      act(() =>
        createRoot(container!).render(
          <form>
            <Input name="email" type="email" />
          </form>
        )
      )

      const input = container.querySelector("input") as HTMLInputElement
      expect(input?.name).toBe("email")
    })
  })
})
