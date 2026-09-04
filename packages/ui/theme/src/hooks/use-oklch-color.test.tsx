import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useOklchColor } from "./use-oklch-color"

/**
 * `hexFocused`/`cssFocused`/`rgbFocused` gate the hook's "revert an
 * unfocused field to the canonical value" render-time adjustment (see
 * `use-oklch-color.tsx`). Without marking a field focused first, any typed
 * text gets overwritten back to the canonical value on the very next
 * render — before a test's `commit*()` call ever sees it. Real inputs set
 * this via onFocus; tests must do the same.
 */
function focus(ref: { current: boolean | undefined }) {
  act(() => {
    ref.current = true
  })
}

describe("useOklchColor commit handlers are format-scoped (regression)", () => {
  it("commitHex rejects a valid rgb() string instead of silently accepting it", () => {
    const { result } = renderHook(() => useOklchColor())
    const before = result.current.color
    focus(result.current.hexFocused)

    act(() => {
      result.current.setHexText("rgb(0, 255, 0)")
    })
    act(() => {
      result.current.commitHex()
    })

    // Rejected: color unchanged, field reverted to the last valid hex.
    expect(result.current.color).toEqual(before)
    expect(result.current.hexText).toBe(result.current.hex)
  })

  it("commitHex still accepts a real hex string", () => {
    const { result } = renderHook(() => useOklchColor())
    focus(result.current.hexFocused)

    act(() => {
      result.current.setHexText("#ff0000")
    })
    act(() => {
      result.current.commitHex()
    })

    expect(result.current.color.h).toBeCloseTo(29.23, 1)
  })

  it("commitCss rejects a bare triplet instead of silently accepting it", () => {
    const { result } = renderHook(() => useOklchColor())
    const before = result.current.color
    focus(result.current.cssFocused)

    act(() => {
      result.current.setCssText("0.5 0.15 120")
    })
    act(() => {
      result.current.commitCss()
    })

    expect(result.current.color).toEqual(before)
    expect(result.current.cssText).toBe(result.current.css)
  })

  it("commitCss still accepts a real oklch() string", () => {
    const { result } = renderHook(() => useOklchColor())
    focus(result.current.cssFocused)

    act(() => {
      result.current.setCssText("oklch(50% 0.15 120)")
    })
    act(() => {
      result.current.commitCss()
    })

    expect(result.current.color).toEqual({ l: 0.5, c: 0.15, h: 120 })
  })

  it("commitRgb (unchanged) still rejects non-rgb input", () => {
    const { result } = renderHook(() => useOklchColor())
    const before = result.current.color
    focus(result.current.rgbFocused)

    act(() => {
      result.current.setRgbText("#ff0000")
    })
    act(() => {
      result.current.commitRgb()
    })

    expect(result.current.color).toEqual(before)
  })
})
