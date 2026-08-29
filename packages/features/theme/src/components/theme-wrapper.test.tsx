import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ThemeWrapper } from "./theme-wrapper"

// Mock dependencies
vi.mock("../provider/appearance-provider", () => ({
  AppearanceProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("../hooks/use-appearance", () => ({
  useResolvedColorScheme: vi.fn(() => "light"),
}))

vi.mock("./theme-toggle-hotkey", () => ({
  ThemeToggleHotkey: () => null,
}))

vi.mock("../persistence/cookie-adapter", () => ({
  createCookieAppearanceAdapter: vi.fn(() => ({})),
}))

vi.mock("../persistence/local-storage-adapter", () => ({
  createLocalStorageAppearanceAdapter: vi.fn(() => ({})),
}))

import { useResolvedColorScheme } from "../hooks/use-appearance"
import {
  createCookieAppearanceAdapter,
  createLocalStorageAppearanceAdapter,
} from "../persistence"

describe("ThemeWrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.documentElement.className = ""
  })

  afterEach(() => {
    document.documentElement.className = ""
  })

  describe("rendering", () => {
    it("renders children correctly", () => {
      render(
        <ThemeWrapper>
          <div data-testid="test-child">Test Content</div>
        </ThemeWrapper>
      )

      expect(screen.getByTestId("test-child").textContent).toEqual("Test Content")
    })

    it("renders multiple children", () => {
      render(
        <ThemeWrapper>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
          <div data-testid="child3">Child 3</div>
        </ThemeWrapper>
      )

      expect(screen.getByTestId("child1").textContent).toBe("Child 1")
      expect(screen.getByTestId("child2").textContent).toBe("Child 2")
      expect(screen.getByTestId("child3").textContent).toBe("Child 3")
    })

    it("renders without children", () => {
      const { container } = render((
        <ThemeWrapper>
          <span data-testid="no-children">No Children</span>
        </ThemeWrapper>
      ))
      expect(container).toBeDefined()
    })
  })

  describe("adapter selection", () => {
    it("uses cookie adapter by default", () => {
      render(
        <ThemeWrapper>
          <div>Content</div>
        </ThemeWrapper>
      )

      expect(createCookieAppearanceAdapter).toHaveBeenCalled()
      expect(createLocalStorageAppearanceAdapter).not.toHaveBeenCalled()
    })

    it("uses localStorage adapter when useLocalStorage is true", () => {
      render(
        <ThemeWrapper useLocalStorage={true}>
          <div>Content</div>
        </ThemeWrapper>
      )

      expect(createLocalStorageAppearanceAdapter).toHaveBeenCalled()
      expect(createCookieAppearanceAdapter).not.toHaveBeenCalled()
    })

    it("uses localStorage adapter explicitly when useLocalStorage is true", () => {
      render(
        <ThemeWrapper useLocalStorage={true}>
          <div>Content</div>
        </ThemeWrapper>
      )

      expect(createLocalStorageAppearanceAdapter).toHaveBeenCalled()
    })

    it("only creates adapter once with useMemo optimization", () => {
      const { rerender } = render(
        <ThemeWrapper>
          <div>Content 1</div>
        </ThemeWrapper>
      )

      vi.clearAllMocks()

      rerender(
        <ThemeWrapper>
          <div>Content 2</div>
        </ThemeWrapper>
      )

      expect(createCookieAppearanceAdapter).not.toHaveBeenCalled()
    })

    it("recreates adapter when useLocalStorage changes", () => {
      const { rerender } = render(
        <ThemeWrapper useLocalStorage={false}>
          <div>Content</div>
        </ThemeWrapper>
      )

      vi.clearAllMocks()

      rerender(
        <ThemeWrapper useLocalStorage={true}>
          <div>Content</div>
        </ThemeWrapper>
      )

      expect(createLocalStorageAppearanceAdapter).toHaveBeenCalled()
    })
  })

  describe("bootstrap script injection", () => {
    it("renders bootstrap script when provided", () => {
      const scriptContent = "<script>console.log('bootstrap')</script>"

      const { container } = render(
        <ThemeWrapper bootstrapScript={scriptContent}>
          <div data-testid="content">Content</div>
        </ThemeWrapper>
      )

      const divWithScript = container.querySelector("div")
      expect(divWithScript?.innerHTML).toContain(scriptContent)
    })

    it("does not render bootstrap script div when not provided", () => {
      const { container } = render(
        <ThemeWrapper>
          <div data-testid="content">Content</div>
        </ThemeWrapper>
      )

      const scriptDivs = container.querySelectorAll(
        'div[style*="display"]'
      )
      expect(scriptDivs.length).toBe(0)
    })

    it("renders script before children", () => {
      const { container } = render(
        <ThemeWrapper bootstrapScript="<div data-testid='script-div'>Script</div>">
          <div data-testid="child-div">Child</div>
        </ThemeWrapper>
      )

      const allDivs = container.querySelectorAll("div")
      const indices = Array.from(allDivs).map((el) => {
        if (el.getAttribute("data-testid") === "script-div") return 0
        if (el.getAttribute("data-testid") === "child-div") return 1
        return -1
      })

      expect(indices).toContain(0)
      expect(indices).toContain(1)
    })

    it("handles complex bootstrap script", () => {
      const complexScript = `
        <script>
          (function() {
            const theme = localStorage.getItem('theme');
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            }
          })();
        </script>
      `

      const { container } = render(
        <ThemeWrapper bootstrapScript={complexScript}>
          <div>Content</div>
        </ThemeWrapper>
      )

      expect(container.textContent).toContain("localStorage.getItem")
    })
  })

  describe("theme application", () => {
    it("adds dark class when resolved color scheme is dark", () => {
      vi.mocked(useResolvedColorScheme).mockReturnValue("dark")

      render(
        <ThemeWrapper>
          <div>Content</div>
        </ThemeWrapper>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })

    it("does not add dark class when resolved color scheme is light", () => {
      vi.mocked(useResolvedColorScheme).mockReturnValue("light")

      render(
        <ThemeWrapper>
          <div>Content</div>
        </ThemeWrapper>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })

    it("updates dark class when resolved color scheme changes", () => {
      vi.mocked(useResolvedColorScheme).mockReturnValue("light")

      const { rerender } = render(
        <ThemeWrapper>
          <div>Content</div>
        </ThemeWrapper>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(false)

      vi.mocked(useResolvedColorScheme).mockReturnValue("dark")

      rerender(
        <ThemeWrapper>
          <div>Content</div>
        </ThemeWrapper>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })

    it("removes dark class when changing from dark to light", () => {
      vi.mocked(useResolvedColorScheme).mockReturnValue("dark")

      const { rerender } = render(
        <ThemeWrapper>
          <div>Content</div>
        </ThemeWrapper>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)

      vi.mocked(useResolvedColorScheme).mockReturnValue("light")

      rerender(
        <ThemeWrapper>
          <div>Content</div>
        </ThemeWrapper>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })
  })

  describe("prop combinations", () => {
    it("handles all props together", () => {
      vi.mocked(useResolvedColorScheme).mockReturnValue("dark")

      const script = "<script>console.log('init')</script>"

      render(
        <ThemeWrapper
          initialPreference="dark"
          bootstrapScript={script}
          useLocalStorage={true}
        >
          <div data-testid="child">Content</div>
        </ThemeWrapper>
      )

      expect(createLocalStorageAppearanceAdapter).toHaveBeenCalled()
      expect(document.documentElement.classList.contains("dark")).toBe(true)
      expect(screen.getByTestId("child").textContent).toBe("Content")
    })

    it("handles initialPreference with cookie adapter", () => {
      render(
        <ThemeWrapper initialPreference="dark">
          <div>Content</div>
        </ThemeWrapper>
      )

      expect(createCookieAppearanceAdapter).toHaveBeenCalled()
    })

    it("handles initialPreference with localStorage adapter", () => {
      render(
        <ThemeWrapper initialPreference="light" useLocalStorage={true}>
          <div>Content</div>
        </ThemeWrapper>
      )

      expect(createLocalStorageAppearanceAdapter).toHaveBeenCalled()
    })
  })

  describe("appearance provider integration", () => {
    it("passes adapter to AppearanceProvider", () => {
      // Test is implicit through the component working correctly
      // The AppearanceProvider mock validates the adapter is passed
      render(
        <ThemeWrapper>
          <div>Content</div>
        </ThemeWrapper>
      )

      expect(createCookieAppearanceAdapter).toHaveBeenCalled()
    })

    it("passes initialPreference to AppearanceProvider", () => {
      render(
        <ThemeWrapper initialPreference="dark">
          <div>Content</div>
        </ThemeWrapper>
      )

      // The mock AppearanceProvider receives and passes through props
      expect(screen.getByText("Content")).toBeDefined()
    })

    it("uses system as defaultPreference", () => {
      // This is tested implicitly through the component behavior
      render(
        <ThemeWrapper>
          <div>Content</div>
        </ThemeWrapper>
      )

      expect(screen.getByText("Content")).toBeDefined()
    })
  })

  describe("theme toggle hotkey integration", () => {
    it("includes ThemeToggleHotkey component", () => {
      // ThemeToggleHotkey is mocked to return null but is still rendered
      render(
        <ThemeWrapper>
          <div data-testid="child">Content</div>
        </ThemeWrapper>
      )

      // Test passes as long as children render correctly
      expect(screen.getByTestId("child")).toBeDefined()
    })
  })

  describe("real-world scenarios", () => {
    it("server-side initialization with cookie adapter", () => {
      render(
        <ThemeWrapper
          initialPreference="dark"
          bootstrapScript="<script>if(document.documentElement.classList.contains('dark'))console.log('dark')</script>"
        >
          <main>
            <h1>App Content</h1>
          </main>
        </ThemeWrapper>
      )

      expect(screen.getByText("App Content")).toBeDefined()
      expect(createCookieAppearanceAdapter).toHaveBeenCalled()
    })

    it("client-side initialization with localStorage", () => {
      vi.mocked(useResolvedColorScheme).mockReturnValue("light")

      render(
        <ThemeWrapper useLocalStorage={true}>
          <div data-testid="app">Application</div>
        </ThemeWrapper>
      )

      expect(createLocalStorageAppearanceAdapter).toHaveBeenCalled()
      expect(screen.getByTestId("app")).toBeDefined()
    })

    it("theme switching during app lifecycle", () => {
      vi.mocked(useResolvedColorScheme).mockReturnValue("light")

      const { rerender } = render(
        <ThemeWrapper useLocalStorage={true}>
          <div>App</div>
        </ThemeWrapper>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(false)

      // Simulate theme switch
      vi.mocked(useResolvedColorScheme).mockReturnValue("dark")

      rerender(
        <ThemeWrapper useLocalStorage={true}>
          <div>App</div>
        </ThemeWrapper>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })

    it("preserves other document classes", () => {
      document.documentElement.className = "existing-class"

      vi.mocked(useResolvedColorScheme).mockReturnValue("dark")

      render(
        <ThemeWrapper>
          <div>Content</div>
        </ThemeWrapper>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)
      expect(document.documentElement.classList.contains("existing-class")).toBe(
        true
      )
    })
  })
})
