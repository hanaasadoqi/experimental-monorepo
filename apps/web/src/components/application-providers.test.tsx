import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  useAppearancePreference,
  useSetAppearancePreference,
} from "@repo/feature-preferences"
import { useResolvedColorScheme } from "@repo/feature-theme"
import { ApplicationProviders } from "./index"

function PreferenceControl() {
  const preference = useAppearancePreference()
  const setPreference = useSetAppearancePreference()
  const scheme = useResolvedColorScheme()

  return (
    <button onClick={() => setPreference("dark")}>
      {preference}:{scheme}
    </button>
  )
}

describe("ApplicationProviders", () => {
  beforeEach(() => {
    document.cookie = "appearance-preference=; Max-Age=0; Path=/"
    document.documentElement.classList.remove("dark")
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  })

  it("projects the server preference through Preferences into Appearance", () => {
    render(
      <ApplicationProviders initialPreference="dark">
        <PreferenceControl />
      </ApplicationProviders>
    )

    expect(screen.getByRole("button").textContent).toBe("dark:dark")
    expect(document.documentElement.dataset.theme).toBe("dark")
  })

  it("persists a preference change and updates the Appearance projection", async () => {
    render(
      <ApplicationProviders initialPreference="light">
        <PreferenceControl />
      </ApplicationProviders>
    )
    fireEvent.click(screen.getByRole("button"))

    await waitFor(() => {
      expect(screen.getByRole("button").textContent).toBe("dark:dark")
    })
    expect(document.cookie).toContain("appearance-preference=dark")
  })
})
