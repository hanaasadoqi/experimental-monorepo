import { describe, it, expect, beforeEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { useTheme } from "./use-theme"
import {
  AppearanceProvider,
  useAppearanceStore,
} from "../provider/appearance-provider"
import { createLocalStorageAppearanceAdapter } from "../persistence/local-storage-adapter"

describe("Theme hooks (compatibility delegation)", () => {
  let adapter = createLocalStorageAppearanceAdapter()

  beforeEach(() => {
    localStorage.clear()
    adapter = createLocalStorageAppearanceAdapter()
  })

  describe("useTheme (legacy)", () => {
    it("returns preference and setTheme function", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => (
          <AppearanceProvider adapter={adapter} defaultPreference="light">
            {children}
          </AppearanceProvider>
        ),
      })

      expect(result.current).toHaveProperty("preference")
      expect(result.current).toHaveProperty("setTheme")
    })

    it("returns preference value", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => (
          <AppearanceProvider adapter={adapter} defaultPreference="light">
            {children}
          </AppearanceProvider>
        ),
      })

      expect(result.current.preference).toBe("light")
    })

    it("setTheme is a function", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => (
          <AppearanceProvider adapter={adapter} defaultPreference="light">
            {children}
          </AppearanceProvider>
        ),
      })

      expect(typeof result.current.setTheme).toBe("function")
    })

    it("delegates to Appearance hooks", () => {
      const { result } = renderHook(
        () => ({
          theme: useTheme(),
          store: useAppearanceStore(),
        }),
        {
          wrapper: ({ children }) => (
            <AppearanceProvider adapter={adapter} defaultPreference="dark">
              {children}
            </AppearanceProvider>
          ),
        }
      )

      expect(result.current.theme.preference).toBe(
        result.current.store.getState().preference
      )
    })
  })
})
