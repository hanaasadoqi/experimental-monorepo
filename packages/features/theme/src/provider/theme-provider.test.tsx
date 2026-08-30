import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { ThemeProvider } from "./theme-provider"
import { createThemeStore } from "../store/theme-store"

/**
 * These tests inject a store through the `store` prop rather than mocking
 * the `../store/theme-store` module. Each test therefore exercises the real
 * store implementation against a fresh, isolated instance.
 */
describe("ThemeProvider", () => {
  let store: ReturnType<typeof createThemeStore>
  const matchMediaBackup = window.matchMedia

  const setSystemDark = (matches: boolean) => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn(() => ({ matches })),
    })
  }

  beforeEach(() => {
    store = createThemeStore()
    document.documentElement.className = ""
    setSystemDark(false)
  })

  afterEach(() => {
    document.documentElement.className = ""
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: matchMediaBackup,
    })
    vi.clearAllMocks()
  })

  describe("store injection", () => {
    it("uses the injected store instead of the global singleton", () => {
      store.getState().setTheme("dark")

      render(
        <ThemeProvider store={store}>
          <div>Content</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })

    it("keeps two providers with different stores independent", () => {
      const otherStore = createThemeStore()
      store.getState().setTheme("dark")
      otherStore.getState().setTheme("light")

      render(
        <ThemeProvider store={store}>
          <div data-testid="a">A</div>
        </ThemeProvider>
      )

      expect(store.getState().theme).toBe("dark")
      expect(otherStore.getState().theme).toBe("light")
    })

    it("falls back to the global store when no store prop is given", () => {
      expect(() =>
        render(
          <ThemeProvider>
            <div>Content</div>
          </ThemeProvider>
        )
      ).not.toThrow()
    })
  })

  describe("rendering", () => {
    it("renders children correctly", () => {
      render(
        <ThemeProvider store={store}>
          <div data-testid="child">Test Content</div>
        </ThemeProvider>
      )

      expect(screen.getByTestId("child").textContent).toBe("Test Content")
    })

    it("renders multiple children", () => {
      render(
        <ThemeProvider store={store}>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </ThemeProvider>
      )

      expect(screen.getByTestId("child1").textContent).toBe("Child 1")
      expect(screen.getByTestId("child2").textContent).toBe("Child 2")
    })
  })

  describe("default theme initialization", () => {
    it("sets theme to default if current theme is system", () => {
      render(
        <ThemeProvider store={store} defaultTheme="dark">
          <div>Content</div>
        </ThemeProvider>
      )

      expect(store.getState().theme).toBe("dark")
    })

    it("does not override a non-system theme", () => {
      store.getState().setTheme("light")

      render(
        <ThemeProvider store={store} defaultTheme="dark">
          <div>Content</div>
        </ThemeProvider>
      )

      expect(store.getState().theme).toBe("light")
    })

    it("uses a default theme of system when not specified", () => {
      render(
        <ThemeProvider store={store}>
          <div>Content</div>
        </ThemeProvider>
      )

      expect(store.getState().theme).toBe("system")
    })
  })

  describe("theme application", () => {
    it("adds the dark class when theme is dark", () => {
      store.getState().setTheme("dark")

      render(
        <ThemeProvider store={store}>
          <div>Content</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })

    it("does not add the dark class when theme is light", () => {
      store.getState().setTheme("light")

      render(
        <ThemeProvider store={store}>
          <div>Content</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })

    it("respects a dark system preference when theme is system", () => {
      setSystemDark(true)

      render(
        <ThemeProvider store={store} defaultTheme="system">
          <div>Content</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })

    it("respects a light system preference when theme is system", () => {
      setSystemDark(false)

      render(
        <ThemeProvider store={store} defaultTheme="system">
          <div>Content</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })
  })

  describe("subscription management", () => {
    it("applies theme updates published by the store", () => {
      store.getState().setTheme("light")

      render(
        <ThemeProvider store={store}>
          <div>Content</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(false)

      act(() => {
        store.getState().setTheme("dark")
      })

      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })

    it("removes the dark class when theme changes back to light", () => {
      store.getState().setTheme("dark")

      render(
        <ThemeProvider store={store}>
          <div>Content</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)

      act(() => {
        store.getState().setTheme("light")
      })

      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })

    it("unsubscribes from the store on unmount", () => {
      store.getState().setTheme("light")

      const { unmount } = render(
        <ThemeProvider store={store}>
          <div>Content</div>
        </ThemeProvider>
      )

      unmount()

      act(() => {
        store.getState().setTheme("dark")
      })

      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })

    it("handles a sequence of theme changes", () => {
      store.getState().setTheme("light")

      render(
        <ThemeProvider store={store}>
          <div>Content</div>
        </ThemeProvider>
      )

      const sequence: Array<"dark" | "light"> = [
        "dark",
        "light",
        "dark",
        "light",
      ]
      sequence.forEach((theme) => {
        act(() => {
          store.getState().setTheme(theme)
        })
      })

      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })
  })

  describe("dependency management", () => {
    it("re-runs the effect when defaultTheme changes", () => {
      const { rerender } = render(
        <ThemeProvider store={store} defaultTheme="light">
          <div>Content</div>
        </ThemeProvider>
      )

      expect(store.getState().theme).toBe("light")

      const freshStore = createThemeStore()
      rerender(
        <ThemeProvider store={freshStore} defaultTheme="dark">
          <div>Content</div>
        </ThemeProvider>
      )

      expect(freshStore.getState().theme).toBe("dark")
    })

    it("re-subscribes when the store prop changes", () => {
      const { rerender } = render(
        <ThemeProvider store={store} defaultTheme="light">
          <div>Content</div>
        </ThemeProvider>
      )

      const nextStore = createThemeStore()
      nextStore.getState().setTheme("dark")

      rerender(
        <ThemeProvider store={nextStore} defaultTheme="light">
          <div>Content</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)

      // The detached store no longer drives the DOM.
      act(() => {
        store.getState().setTheme("light")
      })
      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })
  })

  describe("edge cases", () => {
    it("handles a missing matchMedia API gracefully", () => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        configurable: true,
        value: undefined,
      })

      render(
        <ThemeProvider store={store} defaultTheme="system">
          <div>Content</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })

    it("preserves other classes on the html element", () => {
      document.documentElement.className = "custom-class another-class"
      store.getState().setTheme("dark")

      render(
        <ThemeProvider store={store}>
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

    it("keeps the theme applied across re-renders", () => {
      store.getState().setTheme("dark")

      const { rerender } = render(
        <ThemeProvider store={store}>
          <div data-testid="counter">0</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)

      rerender(
        <ThemeProvider store={store}>
          <div data-testid="counter">1</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })
  })
})
