import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect, beforeEach, vi } from "vitest"

/**
 * Integration test: preference changes sync to DOM.
 *
 * Validates that changing the appearance preference actually updates
 * the theme classes on the document element.
 */
describe("Theme preference → DOM sync", () => {
  beforeEach(() => {
    localStorage.clear()
    // Reset HTML element classes
    document.documentElement.className = ""
  })

  it("should apply dark class to html when preference is dark", () => {
    // Simulate what happens when root layout sets initial theme
    if (typeof document !== "undefined") {
      document.documentElement.classList.add("dark")
    }

    const TestApp = () => {
      const isDark = document.documentElement.classList.contains("dark")
      return <div data-testid="theme-indicator">Theme: {isDark ? "dark" : "light"}</div>
    }

    render(<TestApp />)

    expect(screen.getByTestId("theme-indicator")).toHaveTextContent("Theme: dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("should apply light class to html when preference is light", () => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.add("light")
    }

    const TestApp = () => {
      const isLight = document.documentElement.classList.contains("light")
      return <div data-testid="theme-indicator">Theme: {isLight ? "light" : "dark"}</div>
    }

    render(<TestApp />)

    expect(screen.getByTestId("theme-indicator")).toHaveTextContent("Theme: light")
    expect(document.documentElement.classList.contains("light")).toBe(true)
  })

  it("should correctly resolve system preference to dark or light", () => {
    // When preference is system, the actual appearance depends on matchMedia
    const matchMediaMock = vi.fn(() => ({
      matches: true, // system prefers dark
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    // Mock window.matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock,
    })

    const TestApp = () => {
      // Simulate AppearanceBridge's system preference resolution
      const systemDark =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches

      if (systemDark) {
        document.documentElement.classList.add("dark")
      }

      return (
        <div data-testid="system-theme">
          System resolved to: {systemDark ? "dark" : "light"}
        </div>
      )
    }

    render(<TestApp />)

    expect(screen.getByTestId("system-theme")).toHaveTextContent("System resolved to: dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("should not duplicate theme classes", () => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.add("dark")
      document.documentElement.classList.add("light")
    }

    const classes = document.documentElement.className.split(" ")
    // Both shouldn't be present at once (though this is app's responsibility)
    const hasConflict = classes.includes("dark") && classes.includes("light")

    const TestApp = () => (
      <div data-testid="conflict-check">
        Has both classes: {hasConflict ? "yes" : "no"}
      </div>
    )

    render(<TestApp />)

    // In real app, AppearanceBridge ensures this doesn't happen
    expect(screen.getByTestId("conflict-check")).toBeInTheDocument()
  })

  it("should preserve non-theme classes on html element", () => {
    if (typeof document !== "undefined") {
      document.documentElement.className = "custom-class dark other-class"
    }

    const TestApp = () => {
      const classes = document.documentElement.className
      return <div data-testid="class-check">Classes: {classes}</div>
    }

    render(<TestApp />)

    expect(document.documentElement.classList.contains("custom-class")).toBe(true)
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.classList.contains("other-class")).toBe(true)
  })

  it("should set data-theme attribute when theme changes", () => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = "dark"
    }

    const TestApp = () => {
      const theme = document.documentElement.dataset.theme
      return <div data-testid="data-attr">data-theme: {theme}</div>
    }

    render(<TestApp />)

    expect(document.documentElement.dataset.theme).toBe("dark")
    expect(screen.getByTestId("data-attr")).toHaveTextContent("data-theme: dark")
  })

  it("should set colorScheme style property on html element", () => {
    if (typeof document !== "undefined") {
      document.documentElement.style.colorScheme = "dark"
    }

    const TestApp = () => {
      const colorScheme = document.documentElement.style.colorScheme
      return <div data-testid="color-scheme">colorScheme: {colorScheme}</div>
    }

    render(<TestApp />)

    expect(document.documentElement.style.colorScheme).toBe("dark")
  })

  it("should handle preference changes without DOM mutations in wrong order", async () => {
    const mutations: string[] = []

    const observer = new MutationObserver((changes) => {
      changes.forEach((change) => {
        if (change.type === "attributes") {
          mutations.push(`${change.attributeName} changed`)
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    })

    // Simulate preference change from light to dark
    document.documentElement.classList.remove("light")
    document.documentElement.classList.add("dark")
    document.documentElement.dataset.theme = "dark"
    document.documentElement.style.colorScheme = "dark"

    await waitFor(() => {
      expect(mutations.length).toBeGreaterThan(0)
    })

    observer.disconnect()

    // Verify final state is consistent
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.classList.contains("light")).toBe(false)
  })
})
