import { describe, expect, it, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"

import { useTheme, useSetTheme, useCurrentTheme, useIsDark } from "./use-theme"
import { themeStore } from "../store/theme-store"

describe("Theme hooks", () => {
  beforeEach(() => {
    const state = themeStore.getState()
    state.setTheme("system")
  })

  describe("useTheme", () => {
    it("returns current theme state", () => {
      const { result } = renderHook(() => useTheme())

      expect(result.current).toHaveProperty("theme")
      expect(result.current).toHaveProperty("isDark")
      expect(result.current).toHaveProperty("setTheme")
    })

    it("includes setTheme function", () => {
      const { result } = renderHook(() => useTheme())
      expect(typeof result.current.setTheme).toBe("function")
    })
  })

  describe("useSetTheme", () => {
    it("returns setTheme function", () => {
      const { result } = renderHook(() => useSetTheme())
      expect(typeof result.current).toBe("function")
    })

    it("can set theme to dark", () => {
      const { result: setThemeResult } = renderHook(() => useSetTheme())
      const { result: currentThemeResult } = renderHook(() => useCurrentTheme())
      const { result: isDarkResult } = renderHook(() => useIsDark())

      act(() => {
        setThemeResult.current("dark")
      })

      expect(currentThemeResult.current).toBe("dark")
      expect(isDarkResult.current).toBe(true)
    })

    it("can set theme to light", () => {
      const { result: setThemeResult } = renderHook(() => useSetTheme())
      const { result: currentThemeResult } = renderHook(() => useCurrentTheme())
      const { result: isDarkResult } = renderHook(() => useIsDark())

      act(() => {
        setThemeResult.current("light")
      })

      expect(currentThemeResult.current).toBe("light")
      expect(isDarkResult.current).toBe(false)
    })
  })

  describe("useCurrentTheme", () => {
    it("returns current theme value", () => {
      const { result } = renderHook(() => useCurrentTheme())
      expect(typeof result.current).toBe("string")
    })

    it("reflects theme changes", () => {
      const { result: setThemeResult } = renderHook(() => useSetTheme())
      const { result: currentThemeResult } = renderHook(() => useCurrentTheme())

      act(() => {
        setThemeResult.current("dark")
      })
      expect(currentThemeResult.current).toBe("dark")

      act(() => {
        setThemeResult.current("light")
      })
      expect(currentThemeResult.current).toBe("light")
    })
  })

  describe("useIsDark", () => {
    it("returns boolean dark state", () => {
      const { result } = renderHook(() => useIsDark())
      expect(typeof result.current).toBe("boolean")
    })

    it("updates when theme changes", () => {
      const { result: setThemeResult } = renderHook(() => useSetTheme())
      const { result: isDarkResult } = renderHook(() => useIsDark())

      act(() => {
        setThemeResult.current("dark")
      })
      expect(isDarkResult.current).toBe(true)

      act(() => {
        setThemeResult.current("light")
      })
      expect(isDarkResult.current).toBe(false)
    })
  })
})
