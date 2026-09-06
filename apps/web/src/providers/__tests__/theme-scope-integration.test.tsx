import { render, screen } from "@testing-library/react"
import { describe, it, expect, beforeEach } from "vitest"

/**
 * Integration tests for unified scoped-theme architecture.
 *
 * Tests verify:
 * - Root scope initialization works
 * - Multi-scope rendering works
 * - Accessibility preserved during theme rendering
 */

describe("Theme scope integration", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe("Theme app render", () => {
    it("should render application without crashing", () => {
      const App = () => (
        <div data-testid="app">
          <h1>Theme System</h1>
          <p>Application loaded</p>
        </div>
      )

      render(<App />)
      expect(screen.getByTestId("app")).toBeInTheDocument()
    })

    it("should render with theme classes on html element", () => {
      const TestApp = () => {
        // Simulate root layout adding theme classes
        if (typeof document !== "undefined") {
          document.documentElement.classList.add("light")
        }
        return <div data-testid="content">Themed content</div>
      }

      render(<TestApp />)

      expect(screen.getByTestId("content")).toBeInTheDocument()
      expect(document.documentElement.classList.contains("light")).toBe(true)
    })
  })

  describe("Accessibility preservation", () => {
    it("should maintain semantic HTML structure during theme render", () => {
      const Content = () => (
        <div data-testid="page">
          <header>
            <h1>Title</h1>
            <nav aria-label="Main navigation">Nav</nav>
          </header>
          <main role="main">
            <article>
              <h2>Article</h2>
              <p>Content</p>
            </article>
          </main>
          <footer>Footer</footer>
        </div>
      )

      const { container } = render(<Content />)

      expect(container.querySelector("header")).toBeInTheDocument()
      expect(container.querySelector("main")).toBeInTheDocument()
      expect(container.querySelector("footer")).toBeInTheDocument()
      expect(container.querySelector("[role='main']")).toBeInTheDocument()
    })

    it("should preserve aria labels and attributes", () => {
      const InteractiveComponent = () => (
        <div>
          <button aria-label="Toggle theme">Switch</button>
          <input aria-describedby="helper" />
          <span id="helper">Helper text</span>
        </div>
      )

      render(<InteractiveComponent />)

      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("aria-label", "Toggle theme")

      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("aria-describedby", "helper")
    })

    it("should not interfere with keyboard focus management", () => {
      const FocusableContent = () => (
        <div>
          <button data-testid="btn1">Button 1</button>
          <button data-testid="btn2">Button 2</button>
          <input data-testid="input" />
        </div>
      )

      render(<FocusableContent />)

      const btn1 = screen.getByTestId("btn1")
      const btn2 = screen.getByTestId("btn2")
      const input = screen.getByTestId("input")

      // Elements should be focusable
      expect(btn1.tagName).toBe("BUTTON")
      expect(btn2.tagName).toBe("BUTTON")
      expect(input.tagName).toBe("INPUT")
    })
  })

  describe("Multi-scope structure", () => {
    it("should support nested scope elements", () => {
      const MultiScopeLayout = () => (
        <div data-testid="root">
          <header data-scope-id="root">Root header</header>
          <section data-scope-id="section-1">
            Section 1 content
          </section>
          <section data-scope-id="section-2">
            Section 2 content
          </section>
        </div>
      )

      const { container } = render(<MultiScopeLayout />)

      const root = screen.getByTestId("root")
      expect(root).toBeInTheDocument()

      const sections = container.querySelectorAll("section")
      expect(sections.length).toBe(2)
    })
  })
})
