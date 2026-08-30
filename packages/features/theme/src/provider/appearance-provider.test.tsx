import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { act, render, renderHook } from "@testing-library/react"
import { AppearanceProvider, useAppearanceStore } from "./appearance-provider"
import { createLocalStorageAppearanceAdapter } from "../persistence/local-storage-adapter"

describe("AppearanceProvider", () => {
  let adapter = createLocalStorageAppearanceAdapter()

  beforeEach(() => {
    localStorage.clear()
    adapter = createLocalStorageAppearanceAdapter()
  })

  it("renders children", () => {
    const { container } = render(
      <AppearanceProvider adapter={adapter}>
        <div>test content</div>
      </AppearanceProvider>
    )
    expect(container.textContent).toContain("test content")
  })

  it("provides store to context", () => {
    const { result } = renderHook(() => useAppearanceStore(), {
      wrapper: ({ children }) => (
        <AppearanceProvider adapter={adapter}>{children}</AppearanceProvider>
      ),
    })
    expect(result.current).toBeDefined()
    expect(result.current.getState).toBeDefined()
  })

  it("throws if useAppearanceStore used outside provider", () => {
    expect(() => {
      renderHook(() => useAppearanceStore())
    }).toThrow("must be used within an AppearanceProvider")
  })

  it("creates isolated stores for each provider", () => {
    const { result: store1 } = renderHook(() => useAppearanceStore(), {
      wrapper: ({ children }) => (
        <AppearanceProvider adapter={adapter} defaultPreference="light">
          {children}
        </AppearanceProvider>
      ),
    })

    const { result: store2 } = renderHook(() => useAppearanceStore(), {
      wrapper: ({ children }) => (
        <AppearanceProvider adapter={adapter} defaultPreference="dark">
          {children}
        </AppearanceProvider>
      ),
    })

    expect(store1.current).not.toBe(store2.current)
    expect(store1.current.getState().preference).toBe("light")
    expect(store2.current.getState().preference).toBe("dark")
  })

  it("uses initialPreference over defaultPreference", () => {
    const { result } = renderHook(() => useAppearanceStore(), {
      wrapper: ({ children }) => (
        <AppearanceProvider
          adapter={adapter}
          defaultPreference="light"
          initialPreference="dark"
        >
          {children}
        </AppearanceProvider>
      ),
    })
    expect(result.current.getState().preference).toBe("dark")
  })

  it("reads persisted preference from adapter", () => {
    adapter.write("dark")
    const { result } = renderHook(() => useAppearanceStore(), {
      wrapper: ({ children }) => (
        <AppearanceProvider adapter={adapter} defaultPreference="light">
          {children}
        </AppearanceProvider>
      ),
    })
    expect(result.current.getState().preference).toBe("dark")
  })

  describe("lifecycle ownership", () => {
    afterEach(() => {
      document.documentElement.classList.remove("dark")
      document.documentElement.removeAttribute("data-theme")
      document.documentElement.style.removeProperty("color-scheme")
    })

    it("applies the resolved color scheme to the DOM on mount", () => {
      render(
        <AppearanceProvider adapter={adapter} initialPreference="dark">
          <div>content</div>
        </AppearanceProvider>
      )

      expect(document.documentElement.classList.contains("dark")).toBe(true)
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark")
      expect(document.documentElement.style.colorScheme).toBe("dark")
    })

    it("persists preference changes through the adapter", () => {
      const { result } = renderHook(() => useAppearanceStore(), {
        wrapper: ({ children }) => (
          <AppearanceProvider adapter={adapter} initialPreference="light">
            {children}
          </AppearanceProvider>
        ),
      })

      act(() => {
        result.current.getState().setPreference("dark")
      })

      expect(adapter.read()).toBe("dark")
      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })

    it("stops writing to the DOM and adapter after unmount", () => {
      const { result, unmount } = renderHook(() => useAppearanceStore(), {
        wrapper: ({ children }) => (
          <AppearanceProvider adapter={adapter} initialPreference="light">
            {children}
          </AppearanceProvider>
        ),
      })
      const store = result.current

      unmount()

      act(() => {
        store.getState().setPreference("dark")
      })

      expect(document.documentElement.classList.contains("dark")).toBe(false)
      expect(adapter.read()).toBeNull()
    })

    it("defaults to a localStorage adapter when none is provided", () => {
      const { result } = renderHook(() => useAppearanceStore(), {
        wrapper: ({ children }) => (
          <AppearanceProvider initialPreference="light">
            {children}
          </AppearanceProvider>
        ),
      })

      act(() => {
        result.current.getState().setPreference("dark")
      })

      expect(localStorage.getItem("appearance-preference")).toBe("dark")
    })

    it("restores the persisted preference with the default adapter", () => {
      localStorage.setItem("appearance-preference", "dark")

      const { result } = renderHook(() => useAppearanceStore(), {
        wrapper: ({ children }) => (
          <AppearanceProvider defaultPreference="light">
            {children}
          </AppearanceProvider>
        ),
      })

      expect(result.current.getState().preference).toBe("dark")
    })
  })
})
