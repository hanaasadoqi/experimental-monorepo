import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ThemeProvider } from "./theme-provider"
import { themeStore } from "../store/theme-store"

// Mock the store
vi.mock("../store/theme-store", () => ({
  themeStore: {
    getState: vi.fn(),
    subscribe: vi.fn(),
  },
}))

describe("ThemeProvider", () => {
  let mockGetState: ReturnType<typeof vi.fn>
  let mockSubscribe: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockGetState = vi.fn()
    mockSubscribe = vi.fn(() => vi.fn()) // Return unsubscribe function

    vi.mocked(themeStore).getState = mockGetState
    vi.mocked(themeStore).subscribe = mockSubscribe

    // Clear document classes
    document.documentElement.className = ""
  })

  afterEach(() => {
    vi.clearAllMocks()
    document.documentElement.className = ""
  })

  describe("rendering", () => {
    it("renders children correctly", () => {
      mockGetState.mockReturnValue({
        theme: "light",
        isDark: false,
        setTheme: vi.fn(),
      })
      mockSubscribe.mockReturnValue(vi.fn())

      render(
        <ThemeProvider>
          <div data-testid="child">Test Content</div>
        </ThemeProvider>
      )

      const child = screen.getByTestId("child")
      expect(child.textContent).toBe("Test Content")
    })

    it("renders multiple children", () => {
      mockGetState.mockReturnValue({
        theme: "light",
        isDark: false,
        setTheme: vi.fn(),
      })
      mockSubscribe.mockReturnValue(vi.fn())

      render(
        <ThemeProvider>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
          <div data-testid="child3">Child 3</div>
        </ThemeProvider>
      )

      expect(screen.getByTestId("child1").textContent).toBe("Child 1")
      expect(screen.getByTestId("child2").textContent).toBe("Child 2")
      expect(screen.getByTestId("child3").textContent).toBe("Child 3")
    })
  })

  describe("default theme initialization", () => {
    it("sets theme to default if current theme is system", () => {
      const setThemeMock = vi.fn()
      mockGetState.mockReturnValue({
        theme: "system",
        isDark: false,
        setTheme: setThemeMock,
      })
      mockSubscribe.mockReturnValue(vi.fn())

      render(
        <ThemeProvider defaultTheme="dark">
          <div>Content</div>
        </ThemeProvider>
      )

      expect(setThemeMock).toHaveBeenCalledWith("dark")
    })

    it("does not override non-system theme", () => {
      const setThemeMock = vi.fn()
      mockGetState.mockReturnValue({
        theme: "light",
        isDark: false,
        setTheme: setThemeMock,
      })
      mockSubscribe.mockReturnValue(vi.fn())

      render(
        <ThemeProvider defaultTheme="dark">
          <div>Content</div>
        </ThemeProvider>
      )

      expect(setThemeMock).not.toHaveBeenCalled()
    })

    it("uses default theme of system when not specified", () => {
      const setThemeMock = vi.fn()
      mockGetState.mockReturnValue({
        theme: "system",
        isDark: false,
        setTheme: setThemeMock,
      })
      mockSubscribe.mockReturnValue(vi.fn())

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      )

      expect(setThemeMock).toHaveBeenCalledWith("system")
    })
  })

  describe("theme application", () => {
    it("adds dark class to html element when theme is dark", () => {
      mockGetState.mockReturnValue({
        theme: "dark",
        isDark: true,
        setTheme: vi.fn(),
      })
      mockSubscribe.mockReturnValue(vi.fn())

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })

    it("does not add dark class when theme is light", () => {
      mockGetState.mockReturnValue({
        theme: "light",
        isDark: false,
        setTheme: vi.fn(),
      })
      mockSubscribe.mockReturnValue(vi.fn())

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })

    it("respects system preference when theme is system and dark", () => {
      mockGetState.mockReturnValue({
        theme: "system",
        isDark: true,
        setTheme: vi.fn(),
      })
      mockSubscribe.mockReturnValue(vi.fn())

      // Mock matchMedia to return dark preference
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn(() => ({
          matches: true,
        })),
      })

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })

    it("respects system preference when theme is system and light", () => {
      mockGetState.mockReturnValue({
        theme: "system",
        isDark: false,
        setTheme: vi.fn(),
      })
      mockSubscribe.mockReturnValue(vi.fn())

      // Mock matchMedia to return light preference
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn(() => ({
          matches: false,
        })),
      })

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })
  })

  describe("subscription management", () => {
    it("subscribes to store changes", () => {
      mockGetState.mockReturnValue({
        theme: "light",
        isDark: false,
        setTheme: vi.fn(),
      })
      mockSubscribe.mockReturnValue(vi.fn())

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      )

      expect(mockSubscribe).toHaveBeenCalled()
    })

    it("unsubscribes from store on unmount", () => {
      const unsubscribeMock = vi.fn()
      mockGetState.mockReturnValue({
        theme: "light",
        isDark: false,
        setTheme: vi.fn(),
      })
      mockSubscribe.mockReturnValue(unsubscribeMock)

      const { unmount } = render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      )

      unmount()

      expect(unsubscribeMock).toHaveBeenCalled()
    })

    it("applies theme updates from store changes", () => {
      const setThemeMock = vi.fn()
      mockGetState.mockReturnValue({
        theme: "light",
        isDark: false,
        setTheme: setThemeMock,
      })

      let subscriptionCallback: ((state: any) => void) | null = null
      mockSubscribe.mockImplementation((callback) => {
        subscriptionCallback = callback
        return vi.fn()
      })

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      )

      // Simulate theme change from light to dark
      expect(document.documentElement.classList.contains("dark")).toBe(false)

      if (subscriptionCallback) {
        subscriptionCallback({ theme: "dark", isDark: true })
      }

      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })

    it("removes dark class when theme changes to light", () => {
      mockGetState.mockReturnValue({
        theme: "dark",
        isDark: true,
        setTheme: vi.fn(),
      })

      let subscriptionCallback: ((state: any) => void) | null = null
      mockSubscribe.mockImplementation((callback) => {
        subscriptionCallback = callback
        return vi.fn()
      })

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)

      if (subscriptionCallback) {
        subscriptionCallback({ theme: "light", isDark: false })
      }

      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })
  })

  describe("dependency management", () => {
    it("re-runs effect when defaultTheme changes", () => {
      mockGetState.mockReturnValue({
        theme: "system",
        isDark: false,
        setTheme: vi.fn(),
      })
      mockSubscribe.mockReturnValue(vi.fn())

      const { rerender } = render(
        <ThemeProvider defaultTheme="light">
          <div>Content</div>
        </ThemeProvider>
      )

      vi.clearAllMocks()
      const newSetThemeMock = vi.fn()
      mockGetState.mockReturnValue({
        theme: "system",
        isDark: false,
        setTheme: newSetThemeMock,
      })

      rerender(
        <ThemeProvider defaultTheme="dark">
          <div>Content</div>
        </ThemeProvider>
      )

      expect(newSetThemeMock).toHaveBeenCalledWith("dark")
    })
  })

  describe("edge cases", () => {
    it("handles missing matchMedia API gracefully", () => {
      const matchMediaBackup = window.matchMedia
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: undefined,
      })

      mockGetState.mockReturnValue({
        theme: "system",
        isDark: false,
        setTheme: vi.fn(),
      })
      mockSubscribe.mockReturnValue(vi.fn())

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(false)

      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: matchMediaBackup,
      })
    })

    it("handles multiple theme changes in sequence", () => {
      mockGetState.mockReturnValue({
        theme: "light",
        isDark: false,
        setTheme: vi.fn(),
      })

      let subscriptionCallback: ((state: any) => void) | null = null
      mockSubscribe.mockImplementation((callback) => {
        subscriptionCallback = callback
        return vi.fn()
      })

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      )

      // Sequence of theme changes
      const themes = [
        { theme: "dark", isDark: true },
        { theme: "light", isDark: false },
        { theme: "dark", isDark: true },
        { theme: "light", isDark: false },
      ]

      themes.forEach((themeState) => {
        if (subscriptionCallback) {
          subscriptionCallback(themeState)
        }
      })

      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })

    it("preserves other classes on html element", () => {
      document.documentElement.className = "custom-class another-class"

      mockGetState.mockReturnValue({
        theme: "dark",
        isDark: true,
        setTheme: vi.fn(),
      })
      mockSubscribe.mockReturnValue(vi.fn())

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)
      expect(document.documentElement.classList.contains("custom-class")).toBe(
        true
      )
      expect(document.documentElement.classList.contains("another-class")).toBe(
        true
      )
    })
  })

  describe("real-world scenarios", () => {
    it("initializes dark theme on first render with system preference", () => {
      mockGetState.mockReturnValue({
        theme: "system",
        isDark: true,
        setTheme: vi.fn(),
      })
      mockSubscribe.mockReturnValue(vi.fn())

      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn(() => ({ matches: true })),
      })

      render(
        <ThemeProvider defaultTheme="dark">
          <div>Content</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })

    it("allows user to toggle theme via store subscription", () => {
      mockGetState.mockReturnValue({
        theme: "light",
        isDark: false,
        setTheme: vi.fn(),
      })

      let subscriptionCallback: ((state: any) => void) | null = null
      mockSubscribe.mockImplementation((callback) => {
        subscriptionCallback = callback
        return vi.fn()
      })

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      )

      // User toggles to dark
      if (subscriptionCallback) {
        subscriptionCallback({ theme: "dark", isDark: true })
      }
      expect(document.documentElement.classList.contains("dark")).toBe(true)

      // User toggles back to light
      if (subscriptionCallback) {
        subscriptionCallback({ theme: "light", isDark: false })
      }
      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })

    it("persists theme across component re-renders", () => {
      mockGetState.mockReturnValue({
        theme: "dark",
        isDark: true,
        setTheme: vi.fn(),
      })
      mockSubscribe.mockReturnValue(vi.fn())

      const { rerender } = render(
        <ThemeProvider>
          <div data-testid="counter">0</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)

      rerender(
        <ThemeProvider>
          <div data-testid="counter">1</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })
  })
})
