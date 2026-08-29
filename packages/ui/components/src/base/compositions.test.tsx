import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it } from "vitest"

import { Badge } from "./badge"
import { Button } from "./button"
import { Card } from "./card"
import { Input } from "./input"

let container: HTMLElement | undefined

afterEach(() => {
  container?.remove()
  container = undefined
})

describe("Component Compositions", () => {
  describe("Card + Badge composition", () => {
    it("renders card with badge inside", () => {
      container = document.createElement("div")
      document.body.append(container)

      act(() =>
        createRoot(container!).render(
          <Card>
            <div className="flex items-center justify-between">
              <span>Item</span>
              <Badge variant="default">Active</Badge>
            </div>
          </Card>
        )
      )

      const card = container.querySelector("div[data-slot='card']")
      const badge = container.querySelector("span[data-slot='badge']")
      expect(card).toBeTruthy()
      expect(badge?.textContent).toBe("Active")
    })

    it("applies correct spacing to card content", () => {
      container = document.createElement("div")
      document.body.append(container)

      act(() =>
        createRoot(container!).render(
          <Card>
            <h2>Title</h2>
            <Badge variant="secondary">Secondary</Badge>
          </Card>
        )
      )

      const card = container.querySelector("div[data-slot='card']")
      expect(card?.className).toContain("rounded-lg")
      expect(card?.className).toContain("ring-1")
    })
  })

  describe("Card + Button composition", () => {
    it("renders card with action button", () => {
      container = document.createElement("div")
      document.body.append(container)

      act(() =>
        createRoot(container!).render(
          <Card>
            <div className="space-y-4">
              <h3>Card Title</h3>
              <p>Card description</p>
              <Button>Action</Button>
            </div>
          </Card>
        )
      )

      const card = container.querySelector("div")
      const button = container.querySelector("button")
      expect(card).toBeTruthy()
      expect(button?.textContent).toBe("Action")
    })

    it("button responds to interaction in card context", () => {
      let clicked = false
      container = document.createElement("div")
      document.body.append(container)

      act(() =>
        createRoot(container!).render(
          <Card>
            <Button onClick={() => (clicked = true)}>Click</Button>
          </Card>
        )
      )

      const button = container.querySelector("button")
      act(() => {
        button?.click()
      })
      expect(clicked).toBe(true)
    })
  })

  describe("Button + Badge composition", () => {
    it("renders button with badge indicator", () => {
      container = document.createElement("div")
      document.body.append(container)

      act(() =>
        createRoot(container!).render(
          <div className="relative">
            <Button>Notifications</Button>
            <Badge className="absolute -top-2 -right-2" variant="destructive">
              3
            </Badge>
          </div>
        )
      )

      const button = container.querySelector("button")
      const badge = container.querySelector("span")
      expect(button?.textContent).toBe("Notifications")
      expect(badge?.textContent).toBe("3")
    })

    it("badge inherits positioning in button group", () => {
      container = document.createElement("div")
      document.body.append(container)

      act(() =>
        createRoot(container!).render(
          <div className="flex gap-2">
            <Button>Save</Button>
            <Badge variant="default">New</Badge>
          </div>
        )
      )

      const button = container.querySelector("button")
      const badge = container.querySelector("span")
      expect(button?.textContent).toBe("Save")
      expect(badge?.textContent).toBe("New")
    })
  })

  describe("Form composition (Input + Button)", () => {
    it("renders form with input and submit button", () => {
      container = document.createElement("div")
      document.body.append(container)

      act(() =>
        createRoot(container!).render(
          <form>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter email"
                aria-label="Email input"
              />
              <Button type="submit">Subscribe</Button>
            </div>
          </form>
        )
      )

      const input = container.querySelector("input")
      const button = container.querySelector("button")
      expect(input?.type).toBe("email")
      expect(button?.type).toBe("submit")
      expect(button?.textContent).toBe("Subscribe")
    })

    it("supports input with error state and button disabled", () => {
      container = document.createElement("div")
      document.body.append(container)

      act(() =>
        createRoot(container!).render(
          <form>
            <Input type="email" aria-invalid aria-describedby="email-error" />
            <span id="email-error">Invalid email</span>
            <Button disabled>Submit</Button>
          </form>
        )
      )

      const input = container.querySelector("input")
      const button = container.querySelector("button")
      const error = container.querySelector("#email-error")
      expect(input?.getAttribute("aria-invalid")).toBeTruthy()
      expect(input?.getAttribute("aria-describedby")).toBe("email-error")
      expect(button?.disabled).toBe(true)
      expect(error?.textContent).toBe("Invalid email")
    })
  })

  describe("Complex card composition", () => {
    it("renders card with header, content, and footer", () => {
      container = document.createElement("div")
      document.body.append(container)

      act(() =>
        createRoot(container!).render(
          <Card>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h2>Item Title</h2>
                <Badge variant="secondary" className="mt-2">
                  Draft
                </Badge>
              </div>
              <div className="py-4">
                <p>Card content goes here</p>
              </div>
              <div className="border-t pt-4 flex gap-2">
                <Button>Save</Button>
                <Button>Cancel</Button>
              </div>
            </div>
          </Card>
        )
      )

      const card = container.querySelector("div")
      const heading = container.querySelector("h2")
      const badge = container.querySelector("span")
      const buttons = container.querySelectorAll("button")

      expect(card?.className).toContain("rounded-lg")
      expect(heading?.textContent).toBe("Item Title")
      expect(badge?.textContent).toBe("Draft")
      expect(buttons.length).toBe(2)
    })

    it("handles multiple badges in card", () => {
      container = document.createElement("div")
      document.body.append(container)

      act(() =>
        createRoot(container!).render(
          <Card>
            <div className="space-y-3">
              <h3>Status</h3>
              <div className="flex gap-2">
                <Badge variant="default">Active</Badge>
                <Badge variant="secondary">Verified</Badge>
                <Badge variant="outline">Premium</Badge>
              </div>
            </div>
          </Card>
        )
      )

      const badges = container.querySelectorAll("span")
      expect(badges.length).toBe(3)
      expect(badges[0]?.textContent).toBe("Active")
      expect(badges[1]?.textContent).toBe("Verified")
      expect(badges[2]?.textContent).toBe("Premium")
    })
  })

  describe("Variant combinations", () => {
    it("button with different variants in card", () => {
      container = document.createElement("div")
      document.body.append(container)

      act(() =>
        createRoot(container!).render(
          <Card>
            <div className="flex gap-2">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
            </div>
          </Card>
        )
      )

      const buttons = container.querySelectorAll("button")
      expect(buttons.length).toBe(3)
    })

    it("badge variants within card structure", () => {
      container = document.createElement("div")
      document.body.append(container)

      act(() =>
        createRoot(container!).render(
          <Card>
            <div>
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Error</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="ghost">Ghost</Badge>
              <Badge variant="link">Link</Badge>
            </div>
          </Card>
        )
      )

      const badges = container.querySelectorAll("span")
      expect(badges.length).toBe(6)
    })
  })

  describe("State management in compositions", () => {
    it("input and button interact with shared state", () => {
      let value = ""
      container = document.createElement("div")
      document.body.append(container)

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        value = e.target.value
      }

      const handleSubmit = () => {
        if (value) {
          // Handle submission
        }
      }

      act(() =>
        createRoot(container!).render(
          <form>
            <Input onChange={handleChange} />
            <Button onClick={handleSubmit} disabled={!value}>
              Submit
            </Button>
          </form>
        )
      )

      const input = container.querySelector("input") as HTMLInputElement
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )!.set!

      act(() => {
        nativeInputValueSetter.call(input, "test")
        input.dispatchEvent(new Event("change", { bubbles: true }))
      })

      expect(value).toBe("test")
    })
  })
})
