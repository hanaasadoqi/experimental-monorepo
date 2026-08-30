import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  AppearanceRuntimeProvider,
  useAppearancePreference,
  useResolvedColorScheme,
  useSetAppearancePreference,
} from "../index"

function AppearanceControl() {
  const preference = useAppearancePreference()
  const scheme = useResolvedColorScheme()
  const setPreference = useSetAppearancePreference()

  return (
    <button onClick={() => setPreference("dark")}>
      {preference}:{scheme}
    </button>
  )
}

describe("AppearanceRuntimeProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    document.documentElement.classList.remove("dark")
    document.documentElement.removeAttribute("data-theme")
    document.documentElement.style.colorScheme = ""
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("projects the supplied preference into Appearance and the DOM", () => {
    render(
      <AppearanceRuntimeProvider preference="dark">
        <AppearanceControl />
      </AppearanceRuntimeProvider>
    )

    expect(screen.getByRole("button").textContent).toBe("dark:dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.dataset.theme).toBe("dark")
    expect(document.documentElement.style.colorScheme).toBe("dark")
  })

  it("updates the projection when the controlled preference changes", () => {
    const { rerender } = render(
      <AppearanceRuntimeProvider preference="dark">
        <AppearanceControl />
      </AppearanceRuntimeProvider>
    )

    rerender(
      <AppearanceRuntimeProvider preference="light">
        <AppearanceControl />
      </AppearanceRuntimeProvider>
    )

    expect(screen.getByRole("button").textContent).toBe("light:light")
    expect(document.documentElement.classList.contains("dark")).toBe(false)
    expect(document.documentElement.dataset.theme).toBe("light")
  })

  it("reports a user-driven preference change to its owner", () => {
    const onPreferenceChange = vi.fn()

    render(
      <AppearanceRuntimeProvider
        preference="light"
        onPreferenceChange={onPreferenceChange}
      >
        <AppearanceControl />
      </AppearanceRuntimeProvider>
    )
    fireEvent.click(screen.getByRole("button"))

    expect(onPreferenceChange).toHaveBeenCalledWith("dark")
    expect(screen.getByRole("button").textContent).toBe("dark:dark")
  })
})
