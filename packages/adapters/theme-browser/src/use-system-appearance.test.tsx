import { createMatchMediaMock } from "@repo/foundation-test-mocks/browser"
import { act, renderHook } from "@testing-library/react"
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  detectSystemAppearance,
  subscribeToSystemAppearanceChanges,
} from "./browser-appearance-environment"
import { useSystemAppearance } from "./use-system-appearance"

afterEach(() => vi.unstubAllGlobals())

describe("system appearance observation", () => {
  it("detects and reacts to system appearance changes", () => {
    const media = createMatchMediaMock(false)
    vi.stubGlobal("matchMedia", media.matchMedia)
    expect(detectSystemAppearance()).toBe("light")
    const { result, unmount } = renderHook(() => useSystemAppearance())
    expect(result.current).toBe("light")
    act(() => media.fireChange(true))
    expect(result.current).toBe("dark")
    expect(media.listenerCount()).toBe(1)
    unmount()
    expect(media.listenerCount()).toBe(0)
  })

  it("falls back safely when matchMedia throws", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined)
    vi.stubGlobal("matchMedia", () => {
      throw new Error("unsupported")
    })
    expect(detectSystemAppearance()).toBe("light")
    expect(subscribeToSystemAppearanceChanges(() => undefined)).toBeTypeOf(
      "function"
    )
  })

  it("uses the deterministic light snapshot during server rendering", () => {
    const media = createMatchMediaMock(true)
    vi.stubGlobal("matchMedia", media.matchMedia)

    function ServerAppearance() {
      const appearance = useSystemAppearance()
      return createElement("span", { "data-appearance": appearance })
    }

    expect(renderToString(createElement(ServerAppearance))).toContain(
      'data-appearance="light"'
    )
  })
})
