import { describe, it, expect, beforeEach } from "vitest"
import { render, renderHook } from "@testing-library/react"
import {
  // Existing provider export
  AppearanceProvider,
  // Existing hooks
  useTheme,
  useAppearance,
  // Existing store singleton
  themeStore,
  // Existing hotkey
  ThemeToggleHotkey,
} from "@repo/feature-theme"
import { createLocalStorageAppearanceAdapter } from "./persistence/local-storage-adapter"

describe("Compatibility: existing Theme exports must remain available", () => {
  let adapter: ReturnType<typeof createLocalStorageAppearanceAdapter>

  beforeEach(() => {
    localStorage.clear()
    adapter = createLocalStorageAppearanceAdapter()
  })

  describe("AppearanceProvider", () => {
    it("renders with children prop", () => {
      const { container } = render(
        <AppearanceProvider adapter={adapter}>
          <div>content</div>
        </AppearanceProvider>
      )
      expect(container.textContent).toContain("content")
    })
  })

  describe("useTheme hook (unified interface)", () => {
    it("returns preference property", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => (
          <AppearanceProvider adapter={adapter}>{children}</AppearanceProvider>
        ),
      })
      expect(result.current).toHaveProperty("preference")
    })

    it("returns setTheme function", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => (
          <AppearanceProvider adapter={adapter}>{children}</AppearanceProvider>
        ),
      })
      expect(typeof result.current.setTheme).toBe("function")
    })
  })

  describe("useAppearance hook (new)", () => {
    it("returns complete appearance state", () => {
      const { result } = renderHook(() => useAppearance(), {
        wrapper: ({ children }) => (
          <AppearanceProvider adapter={adapter}>{children}</AppearanceProvider>
        ),
      })
      expect(result.current).toHaveProperty("preference")
      expect(result.current).toHaveProperty("resolvedColorScheme")
      expect(result.current).toHaveProperty("setPreference")
    })
  })

  describe("ThemeToggleHotkey", () => {
    it("is importable", () => {
      expect(ThemeToggleHotkey).toBeDefined()
    })
  })

  describe("themeStore singleton", () => {
    it("is importable and has getState", () => {
      expect(themeStore).toBeDefined()
      expect(typeof themeStore.getState).toBe("function")
    })

    it("getState returns preference and setPreference", () => {
      const state = themeStore.getState()
      expect(state).toHaveProperty("preference")
      expect(typeof state.setPreference).toBe("function")
    })
  })
})
