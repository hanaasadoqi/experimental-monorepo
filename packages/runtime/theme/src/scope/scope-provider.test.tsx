import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ThemeScopeProvider } from "./scope-provider"
import { useThemeScope } from "./use-theme-scope"

function ModeProbe() {
  const { isDarkMode } = useThemeScope()
  return (
    <output>{isDarkMode === undefined ? "unset" : String(isDarkMode)}</output>
  )
}

describe("ThemeScopeProvider appearance enforcement", () => {
  it("uses appearance only to initialize an undefined dark-mode state", async () => {
    const applyResolvedAppearance = vi.fn()

    const { rerender } = render(
      <ThemeScopeProvider
        scopeId="root"
        theme={{ enableDarkMode: true }}
        resolvedAppearance="light"
        applyResolvedAppearance={applyResolvedAppearance}
      >
        <ModeProbe />
      </ThemeScopeProvider>
    )

    await waitFor(() => expect(screen.getByText("false")).toBeTruthy())
    expect(applyResolvedAppearance).toHaveBeenLastCalledWith("light")

    rerender(
      <ThemeScopeProvider
        scopeId="root"
        theme={{ enableDarkMode: true }}
        resolvedAppearance="dark"
        applyResolvedAppearance={applyResolvedAppearance}
      >
        <ModeProbe />
      </ThemeScopeProvider>
    )

    await waitFor(() => expect(screen.getByText("false")).toBeTruthy())
    expect(applyResolvedAppearance).toHaveBeenLastCalledWith("light")
    expect(applyResolvedAppearance).toHaveBeenCalledTimes(1)
  })

  it("applies an existing isDarkMode value instead of appearance", async () => {
    const applyResolvedAppearance = vi.fn()

    render(
      <ThemeScopeProvider
        scopeId="root"
        theme={{ enableDarkMode: true }}
        initialIsDarkMode
        resolvedAppearance="light"
        applyResolvedAppearance={applyResolvedAppearance}
      >
        <ModeProbe />
      </ThemeScopeProvider>
    )

    await waitFor(() => expect(screen.getByText("true")).toBeTruthy())
    expect(applyResolvedAppearance).toHaveBeenCalledWith("dark")
  })

  it("keeps the global scope synchronized with resolved appearance", async () => {
    const applyResolvedAppearance = vi.fn()
    const { rerender } = render(
      <ThemeScopeProvider
        scopeId="root"
        theme={{ enableDarkMode: true }}
        resolvedAppearance="light"
        followResolvedAppearance
        applyResolvedAppearance={applyResolvedAppearance}
      >
        <ModeProbe />
      </ThemeScopeProvider>
    )

    rerender(
      <ThemeScopeProvider
        scopeId="root"
        theme={{ enableDarkMode: true }}
        resolvedAppearance="dark"
        followResolvedAppearance
        applyResolvedAppearance={applyResolvedAppearance}
      >
        <ModeProbe />
      </ThemeScopeProvider>
    )

    await waitFor(() => expect(screen.getByText("true")).toBeTruthy())
    expect(applyResolvedAppearance).toHaveBeenLastCalledWith("dark")
  })

  it("does not update or apply appearance when the theme disables dark mode", async () => {
    const applyResolvedAppearance = vi.fn()

    render(
      <ThemeScopeProvider
        scopeId="root"
        theme={{ enableDarkMode: false }}
        resolvedAppearance="dark"
        applyResolvedAppearance={applyResolvedAppearance}
      >
        <ModeProbe />
      </ThemeScopeProvider>
    )

    await waitFor(() => expect(screen.getByText("unset")).toBeTruthy())
    expect(applyResolvedAppearance).not.toHaveBeenCalled()
  })
})
