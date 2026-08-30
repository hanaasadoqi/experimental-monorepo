import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { createThemeStore } from "./theme-store"
import type { Theme } from "../types"

describe("ThemeStore", () => {
  describe("store creation and initialization", () => {
    it("creates a store instance", () => {
      const store = createThemeStore()
      expect(store).toBeDefined()
      expect(store.getState).toBeDefined()
    })

    it("initializes with correct default state", () => {
      const store = createThemeStore()
      const state = store.getState()

      expect(state.theme).toBe("system")
      expect(state.isDark).toBe(false)
      expect(state.setTheme).toBeDefined()
    })

    it("initializes isDark to false by default", () => {
      const store = createThemeStore()
      expect(store.getState().isDark).toBe(false)
    })
  })

  describe("setTheme action", () => {
    it("updates theme to light", () => {
      const store = createThemeStore()
      store.getState().setTheme("light")

      expect(store.getState().theme).toBe("light")
    })

    it("updates theme to dark", () => {
      const store = createThemeStore()
      store.getState().setTheme("dark")

      expect(store.getState().theme).toBe("dark")
    })

    it("updates theme to system", () => {
      const store = createThemeStore()
      store.getState().setTheme("system")

      expect(store.getState().theme).toBe("system")
    })

    it("updates isDark when setting theme to dark", () => {
      const store = createThemeStore()
      store.getState().setTheme("dark")

      expect(store.getState().isDark).toBe(true)
    })

    it("updates isDark when setting theme to light", () => {
      const store = createThemeStore()
      store.getState().setTheme("light")

      expect(store.getState().isDark).toBe(false)
    })

    it("updates both theme and isDark together", () => {
      const store = createThemeStore()

      store.getState().setTheme("dark")
      let state = store.getState()
      expect(state.theme).toBe("dark")
      expect(state.isDark).toBe(true)

      store.getState().setTheme("light")
      state = store.getState()
      expect(state.theme).toBe("light")
      expect(state.isDark).toBe(false)
    })
  })

  describe("isDark calculation for system theme", () => {
    let originalMatchMedia: typeof window.matchMedia

    beforeEach(() => {
      originalMatchMedia = window.matchMedia
    })

    afterEach(() => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: originalMatchMedia,
      })
    })

    it("sets isDark to true when system theme is dark", () => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn(() => ({
          matches: true,
        })),
      })

      const store = createThemeStore()
      store.getState().setTheme("system")

      expect(store.getState().isDark).toBe(true)
    })

    it("sets isDark to false when system theme is light", () => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn(() => ({
          matches: false,
        })),
      })

      const store = createThemeStore()
      store.getState().setTheme("system")

      expect(store.getState().isDark).toBe(false)
    })

    it("respects current system preference on each setTheme call", () => {
      const matchMediaMock = vi.fn(() => ({ matches: true }))
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: matchMediaMock,
      })

      const store = createThemeStore()

      store.getState().setTheme("system")
      expect(store.getState().isDark).toBe(true)

      // Simulate system preference change
      matchMediaMock.mockReturnValue({ matches: false })
      store.getState().setTheme("system")

      expect(store.getState().isDark).toBe(false)
    })
  })

  describe("subscription and state management", () => {
    it("allows subscribing to state changes", () => {
      const store = createThemeStore()
      const callback = vi.fn()

      const unsubscribe = store.subscribe(callback)

      store.getState().setTheme("dark")

      expect(callback).toHaveBeenCalled()
      unsubscribe()
    })

    it("notifies subscribers with updated state", () => {
      const store = createThemeStore()
      let receivedState = null

      store.subscribe((state) => {
        receivedState = state
      })

      store.getState().setTheme("dark")

      expect(receivedState).toEqual({
        theme: "dark",
        isDark: true,
        setTheme: expect.any(Function),
      })
    })

    it("stops notifying after unsubscribe", () => {
      const store = createThemeStore()
      const callback = vi.fn()

      const unsubscribe = store.subscribe(callback)
      store.getState().setTheme("dark")

      expect(callback).toHaveBeenCalledTimes(1)

      unsubscribe()
      store.getState().setTheme("light")

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it("supports multiple subscribers", () => {
      const store = createThemeStore()
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const callback3 = vi.fn()

      store.subscribe(callback1)
      store.subscribe(callback2)
      store.subscribe(callback3)

      store.getState().setTheme("dark")

      expect(callback1).toHaveBeenCalled()
      expect(callback2).toHaveBeenCalled()
      expect(callback3).toHaveBeenCalled()
    })

    it("allows selective unsubscription", () => {
      const store = createThemeStore()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      const unsubscribe1 = store.subscribe(callback1)
      const _unsubscribe2 = store.subscribe(callback2)

      store.getState().setTheme("dark")
      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).toHaveBeenCalledTimes(1)

      unsubscribe1()
      store.getState().setTheme("light")

      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).toHaveBeenCalledTimes(2)
    })
  })

  describe("theme transitions", () => {
    it("handles light to dark transition", () => {
      const store = createThemeStore()
      const callback = vi.fn()

      store.subscribe(callback)

      store.getState().setTheme("light")
      store.getState().setTheme("dark")

      expect(store.getState().theme).toBe("dark")
      expect(store.getState().isDark).toBe(true)
    })

    it("handles dark to light transition", () => {
      const store = createThemeStore()
      const callback = vi.fn()

      store.subscribe(callback)

      store.getState().setTheme("dark")
      store.getState().setTheme("light")

      expect(store.getState().theme).toBe("light")
      expect(store.getState().isDark).toBe(false)
    })

    it("handles transitions through system theme", () => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn(() => ({ matches: true })),
      })

      const store = createThemeStore()

      store.getState().setTheme("light")
      expect(store.getState().isDark).toBe(false)

      store.getState().setTheme("system")
      expect(store.getState().isDark).toBe(true)

      store.getState().setTheme("dark")
      expect(store.getState().isDark).toBe(true)
    })

    it("sequences multiple theme changes correctly", () => {
      const store = createThemeStore()
      const states: { theme: Theme; isDark: boolean }[] = []

      store.subscribe((state) => {
        states.push({ theme: state.theme, isDark: state.isDark })
      })

      const themes: Theme[] = ["light", "dark", "light", "dark", "light"]
      themes.forEach((theme) => store.getState().setTheme(theme))

      expect(states).toEqual([
        { theme: "light", isDark: false },
        { theme: "dark", isDark: true },
        { theme: "light", isDark: false },
        { theme: "dark", isDark: true },
        { theme: "light", isDark: false },
      ])
    })
  })

  describe("edge cases", () => {
    it("handles setting same theme multiple times", () => {
      const store = createThemeStore()
      const callback = vi.fn()

      store.subscribe(callback)

      store.getState().setTheme("dark")
      store.getState().setTheme("dark")
      store.getState().setTheme("dark")

      expect(callback).toHaveBeenCalledTimes(3)
      expect(store.getState().theme).toBe("dark")
    })

    it("maintains state consistency across multiple setTheme calls", () => {
      const store = createThemeStore()

      for (let i = 0; i < 100; i++) {
        const theme = i % 2 === 0 ? "light" : "dark"
        store.getState().setTheme(theme)

        const state = store.getState()
        expect(state.theme).toBe(theme)
        expect(state.isDark).toBe(theme === "dark")
      }
    })

    it("handles window.matchMedia being undefined", () => {
      const matchMediaBackup = window.matchMedia
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: undefined,
      })

      const store = createThemeStore()
      store.getState().setTheme("system")

      expect(store.getState().isDark).toBe(false)

      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: matchMediaBackup,
      })
    })
  })

  describe("real-world scenarios", () => {
    it("simulates user toggling theme preference", () => {
      const store = createThemeStore()
      const currentStates: { theme: Theme; isDark: boolean }[] = []

      store.subscribe((state) => {
        currentStates.push({ theme: state.theme, isDark: state.isDark })
      })

      // User prefers light initially
      store.getState().setTheme("light")
      expect(currentStates[currentStates.length - 1]).toEqual({
        theme: "light",
        isDark: false,
      })

      // User switches to dark mode
      store.getState().setTheme("dark")
      expect(currentStates[currentStates.length - 1]).toEqual({
        theme: "dark",
        isDark: true,
      })

      // User resets to system preference
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn(() => ({ matches: true })),
      })
      store.getState().setTheme("system")
      expect(currentStates[currentStates.length - 1].theme).toBe("system")
    })

    it("works with default export (shared instance)", () => {
      // This tests the pattern of having a singleton store instance
      const store1 = createThemeStore()
      const store2 = createThemeStore()

      // Each call creates a new store instance (not shared)
      store1.getState().setTheme("dark")

      // store2 is independent
      expect(store2.getState().theme).toBe("system")
    })

    it("maintains correct isDark state through app lifecycle", () => {
      const store = createThemeStore()
      const states: string[] = []

      store.subscribe((state) => {
        states.push(`${state.theme}:${state.isDark}`)
      })

      // App starts
      expect(store.getState().theme).toBe("system")

      // User sets preference
      store.getState().setTheme("dark")
      expect(states[states.length - 1]).toBe("dark:true")

      // App reconfigures
      store.getState().setTheme("light")
      expect(states[states.length - 1]).toBe("light:false")

      // App persists and restores
      store.getState().setTheme("dark")
      expect(states[states.length - 1]).toBe("dark:true")
    })
  })
})
