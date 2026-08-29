import { describe, expect, it, beforeEach } from "vitest"

import { useTheme, useSetTheme, useCurrentTheme, useIsDark } from "./use-theme"
import { themeStore } from "../store/theme-store"

describe("Theme hooks", () => {
  beforeEach(() => {
    const state = themeStore.getState()
    state.setTheme("system")
  })

  describe("useTheme", () => {
    it("returns current theme state", () => {
      const theme = useTheme()

      expect(theme).toHaveProperty("theme")
      expect(theme).toHaveProperty("isDark")
      expect(theme).toHaveProperty("setTheme")
    })

    it("includes setTheme function", () => {
      const theme = useTheme()
      expect(typeof theme.setTheme).toBe("function")
    })
  })

  describe("useSetTheme", () => {
    it("returns setTheme function", () => {
      const setTheme = useSetTheme()
      expect(typeof setTheme).toBe("function")
    })

    it("can set theme to dark", () => {
      const setTheme = useSetTheme()
      setTheme("dark")

      expect(useCurrentTheme()).toBe("dark")
      expect(useIsDark()).toBe(true)
    })

    it("can set theme to light", () => {
      const setTheme = useSetTheme()
      setTheme("light")

      expect(useCurrentTheme()).toBe("light")
      expect(useIsDark()).toBe(false)
    })
  })

  describe("useCurrentTheme", () => {
    it("returns current theme value", () => {
      const theme = useCurrentTheme()
      expect(typeof theme).toBe("string")
    })

    it("reflects theme changes", () => {
      const setTheme = useSetTheme()

      setTheme("dark")
      expect(useCurrentTheme()).toBe("dark")

      setTheme("light")
      expect(useCurrentTheme()).toBe("light")
    })
  })

  describe("useIsDark", () => {
    it("returns boolean dark state", () => {
      const isDark = useIsDark()
      expect(typeof isDark).toBe("boolean")
    })

    it("updates when theme changes", () => {
      const setTheme = useSetTheme()

      setTheme("dark")
      expect(useIsDark()).toBe(true)

      setTheme("light")
      expect(useIsDark()).toBe(false)
    })
  })
})
