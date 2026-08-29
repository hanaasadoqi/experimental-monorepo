import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { render } from "@testing-library/react"
import { ThemeToggleHotkey } from "./theme-toggle-hotkey"

// Mock the hooks
vi.mock("../hooks", () => ({
  useResolvedColorScheme: vi.fn(),
  useSetAppearancePreference: vi.fn(),
}))

vi.mock("../utils/is-typing-target", () => ({
  isTypingTarget: vi.fn(),
}))

import { useResolvedColorScheme, useSetAppearancePreference } from "../hooks"
import { isTypingTarget } from "../utils/is-typing-target"

describe("ThemeToggleHotkey", () => {
  let setPreferenceCallback: ReturnType<typeof vi.fn>

  beforeEach(() => {
    setPreferenceCallback = vi.fn()

    vi.mocked(useResolvedColorScheme).mockReturnValue("light")
    vi.mocked(useSetAppearancePreference).mockReturnValue(setPreferenceCallback)
    vi.mocked(isTypingTarget).mockReturnValue(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("component lifecycle and rendering", () => {
    it("renders without error", () => {
      const { unmount } = render(<ThemeToggleHotkey />)
      expect(unmount).toBeDefined()
    })

    it("returns null (no visual output)", () => {
      const { container } = render(<ThemeToggleHotkey />)
      expect(container.firstChild).toBeNull()
    })

    it("sets up and tears down event listeners", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener")
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener")

      const { unmount } = render(<ThemeToggleHotkey />)

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      )

      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })
  })

  describe("keyboard event handling", () => {
    it("ignores events with defaultPrevented set to true", () => {
      render(<ThemeToggleHotkey />)

      const event = new KeyboardEvent("keydown", {
        key: "d",
        bubbles: true,
      })
      Object.defineProperty(event, "defaultPrevented", {
        value: true,
        writable: false,
      })

      window.dispatchEvent(event)

      expect(setPreferenceCallback).not.toHaveBeenCalled()
    })

    it("ignores repeat keydown events", () => {
      render(<ThemeToggleHotkey />)

      const event = new KeyboardEvent("keydown", {
        key: "d",
        repeat: true,
      })

      window.dispatchEvent(event)

      expect(setPreferenceCallback).not.toHaveBeenCalled()
    })

    it("ignores events with metaKey modifier", () => {
      render(<ThemeToggleHotkey />)

      const event = new KeyboardEvent("keydown", {
        key: "d",
        metaKey: true,
      })

      window.dispatchEvent(event)

      expect(setPreferenceCallback).not.toHaveBeenCalled()
    })

    it("ignores events with ctrlKey modifier", () => {
      render(<ThemeToggleHotkey />)

      const event = new KeyboardEvent("keydown", {
        key: "d",
        ctrlKey: true,
      })

      window.dispatchEvent(event)

      expect(setPreferenceCallback).not.toHaveBeenCalled()
    })

    it("ignores events with altKey modifier", () => {
      render(<ThemeToggleHotkey />)

      const event = new KeyboardEvent("keydown", {
        key: "d",
        altKey: true,
      })

      window.dispatchEvent(event)

      expect(setPreferenceCallback).not.toHaveBeenCalled()
    })

    it("ignores non-d keys (case-insensitive check excludes both cases)", () => {
      render(<ThemeToggleHotkey />)

      // Only test keys that are NOT d or D (both are valid)
      const keys = ["a", "b", "c", "e", "1", "Enter", " "]

      keys.forEach((key) => {
        vi.clearAllMocks()
        const event = new KeyboardEvent("keydown", { key })
        window.dispatchEvent(event)
        expect(setPreferenceCallback).not.toHaveBeenCalled()
      })
    })

    it("case-insensitive: triggers on lowercase d", () => {
      vi.mocked(useResolvedColorScheme).mockReturnValue("light")
      vi.mocked(isTypingTarget).mockReturnValue(false)

      render(<ThemeToggleHotkey />)

      const event = new KeyboardEvent("keydown", { key: "d" })
      window.dispatchEvent(event)

      expect(setPreferenceCallback).toHaveBeenCalledWith("dark")
    })

    it("case-insensitive: triggers on uppercase D", () => {
      vi.mocked(useResolvedColorScheme).mockReturnValue("light")
      vi.mocked(isTypingTarget).mockReturnValue(false)

      render(<ThemeToggleHotkey />)

      const event = new KeyboardEvent("keydown", { key: "D" })
      window.dispatchEvent(event)

      expect(setPreferenceCallback).toHaveBeenCalledWith("dark")
    })
  })

  describe("typing target detection", () => {
    it("ignores 'd' key when target is typing element", () => {
      render(<ThemeToggleHotkey />)
      vi.mocked(isTypingTarget).mockReturnValue(true)

      const input = document.createElement("input")
      const event = new KeyboardEvent("keydown", { key: "d" })
      Object.defineProperty(event, "target", { value: input, writable: false })

      window.dispatchEvent(event)

      expect(isTypingTarget).toHaveBeenCalled()
      expect(setPreferenceCallback).not.toHaveBeenCalled()
    })

    it("allows toggle on non-typing elements", () => {
      vi.mocked(useResolvedColorScheme).mockReturnValue("light")
      vi.mocked(isTypingTarget).mockReturnValue(false)

      render(<ThemeToggleHotkey />)

      const button = document.createElement("button")
      const event = new KeyboardEvent("keydown", { key: "d" })
      Object.defineProperty(event, "target", {
        value: button,
        writable: false,
      })

      window.dispatchEvent(event)

      expect(setPreferenceCallback).toHaveBeenCalledWith("dark")
    })

    it("handles null target", () => {
      vi.mocked(useResolvedColorScheme).mockReturnValue("light")
      vi.mocked(isTypingTarget).mockReturnValue(false)

      render(<ThemeToggleHotkey />)

      const event = new KeyboardEvent("keydown", { key: "d" })
      Object.defineProperty(event, "target", { value: null, writable: false })

      window.dispatchEvent(event)

      expect(isTypingTarget).toHaveBeenCalledWith(null)
      expect(setPreferenceCallback).toHaveBeenCalledWith("dark")
    })
  })

  describe("theme toggling logic", () => {
    it("toggles from light to dark", () => {
      vi.mocked(useResolvedColorScheme).mockReturnValue("light")
      vi.mocked(isTypingTarget).mockReturnValue(false)

      render(<ThemeToggleHotkey />)

      const event = new KeyboardEvent("keydown", { key: "d" })
      window.dispatchEvent(event)

      expect(setPreferenceCallback).toHaveBeenCalledWith("dark")
    })

    it("toggles from dark to light", () => {
      vi.mocked(useResolvedColorScheme).mockReturnValue("dark")
      vi.mocked(isTypingTarget).mockReturnValue(false)

      render(<ThemeToggleHotkey />)

      const event = new KeyboardEvent("keydown", { key: "d" })
      window.dispatchEvent(event)

      expect(setPreferenceCallback).toHaveBeenCalledWith("light")
    })

    it("uses the current resolved color scheme", () => {
      const colorSchemes: Array<"light" | "dark"> = ["light", "dark"]

      colorSchemes.forEach((scheme) => {
        vi.clearAllMocks()
        vi.mocked(useResolvedColorScheme).mockReturnValue(scheme)
        vi.mocked(isTypingTarget).mockReturnValue(false)

        const { unmount } = render(<ThemeToggleHotkey />)

        const event = new KeyboardEvent("keydown", { key: "d" })
        window.dispatchEvent(event)

        const expectedPreference = scheme === "dark" ? "light" : "dark"
        expect(setPreferenceCallback).toHaveBeenCalledWith(expectedPreference)

        unmount()
      })
    })
  })

  describe("edge cases", () => {
    it("handles multiple sequential key presses", () => {
      vi.mocked(useResolvedColorScheme)
        .mockReturnValueOnce("light")
        .mockReturnValueOnce("dark")
      vi.mocked(isTypingTarget).mockReturnValue(false)

      render(<ThemeToggleHotkey />)

      window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }))
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }))

      expect(setPreferenceCallback).toHaveBeenCalledTimes(2)
    })

    it("ignores special keyboard keys", () => {
      render(<ThemeToggleHotkey />)

      const specialKeys = [
        "ArrowUp",
        "ArrowDown",
        "Tab",
        "Escape",
        "Enter",
        "Shift",
      ]

      specialKeys.forEach((key) => {
        vi.clearAllMocks()
        window.dispatchEvent(new KeyboardEvent("keydown", { key }))
        expect(setPreferenceCallback).not.toHaveBeenCalled()
      })
    })

    it("ignores keyboard events with multiple modifiers", () => {
      render(<ThemeToggleHotkey />)

      const event = new KeyboardEvent("keydown", {
        key: "d",
        metaKey: true,
        ctrlKey: true,
        altKey: true,
      })

      window.dispatchEvent(event)

      expect(setPreferenceCallback).not.toHaveBeenCalled()
    })

    it("uses current hook values", () => {
      const newSetPreference = vi.fn()
      vi.mocked(useSetAppearancePreference).mockReturnValue(newSetPreference)
      vi.mocked(useResolvedColorScheme).mockReturnValue("light")
      vi.mocked(isTypingTarget).mockReturnValue(false)

      render(<ThemeToggleHotkey />)

      const event = new KeyboardEvent("keydown", { key: "d" })
      window.dispatchEvent(event)

      expect(newSetPreference).toHaveBeenCalledWith("dark")
    })

    it("handles re-renders with different hook values", () => {
      const { rerender } = render(<ThemeToggleHotkey />)

      vi.mocked(useResolvedColorScheme).mockReturnValue("light")
      vi.mocked(isTypingTarget).mockReturnValue(false)
      rerender(<ThemeToggleHotkey />)

      window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }))
      expect(setPreferenceCallback).toHaveBeenCalledWith("dark")

      vi.clearAllMocks()
      vi.mocked(useResolvedColorScheme).mockReturnValue("dark")
      rerender(<ThemeToggleHotkey />)

      window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }))
      expect(setPreferenceCallback).toHaveBeenCalledWith("light")
    })
  })

  describe("real-world scenarios", () => {
    it("allows quick theme toggle during browsing", () => {
      vi.mocked(useResolvedColorScheme).mockReturnValue("light")
      vi.mocked(isTypingTarget).mockReturnValue(false)

      const { rerender } = render(<ThemeToggleHotkey />)

      window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }))
      expect(setPreferenceCallback).toHaveBeenCalledWith("dark")

      // Update mock and rerender to simulate resolved color scheme changing
      vi.clearAllMocks()
      vi.mocked(useResolvedColorScheme).mockReturnValue("dark")
      rerender(<ThemeToggleHotkey />)

      window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }))
      expect(setPreferenceCallback).toHaveBeenCalledWith("light")
    })

    it("ignores D key when typing in form fields", () => {
      render(<ThemeToggleHotkey />)

      const input = document.createElement("input")
      document.body.appendChild(input)
      input.focus()

      vi.mocked(isTypingTarget).mockReturnValue(true)

      const event = new KeyboardEvent("keydown", { key: "d" })
      Object.defineProperty(event, "target", { value: input, writable: false })

      window.dispatchEvent(event)

      expect(setPreferenceCallback).not.toHaveBeenCalled()

      document.body.removeChild(input)
    })

    it("works across page navigation", () => {
      vi.mocked(useResolvedColorScheme).mockReturnValue("light")
      vi.mocked(isTypingTarget).mockReturnValue(false)

      const { unmount: unmount1 } = render(<ThemeToggleHotkey />)
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }))
      expect(setPreferenceCallback).toHaveBeenCalledTimes(1)

      unmount1()

      vi.clearAllMocks()
      const { unmount: unmount2 } = render(<ThemeToggleHotkey />)
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }))
      expect(setPreferenceCallback).toHaveBeenCalledTimes(1)

      unmount2()
    })
  })
})
