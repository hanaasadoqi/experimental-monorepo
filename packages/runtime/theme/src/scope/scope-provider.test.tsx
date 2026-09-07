import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { StateStorage } from "zustand/middleware"

import { applyCssToElement } from "@repo/adapters-theme-browser"

import { useThemeCompilation } from ".."
import { ThemeScopeProvider } from "./scope-provider"
import { getScopeStorageKey } from "./scope-store"
import { useThemeScope } from "./use-theme-scope"

vi.mock("@repo/adapters-theme-browser", () => ({
  applyCssToElement: vi.fn(),
}))

vi.mock("..", () => ({
  useThemeCompilation: vi.fn(),
}))

const mockedApplyCssToElement = vi.mocked(applyCssToElement)
const mockedUseThemeCompilation = vi.mocked(useThemeCompilation)

function ScopeProbe() {
  const {
    id,
    scopeId,
    sourceId,
    overrides,
    enableDarkMode,
    isDarkMode,
    toggleDarkMode,
  } = useThemeScope()

  return (
    <div>
      <output data-testid="theme-id">{id}</output>
      <output data-testid="scope-id">{scopeId}</output>
      <output data-testid="source-id">{sourceId ?? "unset"}</output>
      <output data-testid="primary">{overrides.primary ?? "unset"}</output>
      <output data-testid="dark-mode-enabled">{String(enableDarkMode)}</output>
      <output data-testid="dark-mode">
        {isDarkMode === undefined ? "unset" : String(isDarkMode)}
      </output>
      <button type="button" onClick={toggleDarkMode}>
        Toggle dark mode
      </button>
    </div>
  )
}

function createMemoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  const storage: StateStorage = {
    getItem: vi.fn((name) => values.get(name) ?? null),
    setItem: vi.fn((name, value) => {
      values.set(name, value)
    }),
    removeItem: vi.fn((name) => {
      values.delete(name)
    }),
  }

  return { storage, values }
}

describe("ThemeScopeProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseThemeCompilation.mockReturnValue({
      cssVariables: undefined,
    } as ReturnType<typeof useThemeCompilation>)
  })

  it("renders the scope wrapper and provides its store to children", () => {
    render(
      <ThemeScopeProvider
        scopeId="preview"
        overrides={{ enableDarkMode: true }}
        options={{
          sourceId: "base-theme",
          initialOverrides: { primary: "oklch(50% 0.1 200)" },
        }}
      >
        <ScopeProbe />
      </ThemeScopeProvider>
    )

    const scope = document.querySelector<HTMLElement>(
      '[data-scope-id="preview"]'
    )

    expect(scope).not.toBeNull()
    expect(scope?.id).toBe("preview")
    expect(scope?.classList.contains("theme-scope-provider")).toBe(true)
    expect(scope?.getAttribute("data-theme")).toBe("light")
    expect(scope?.getAttribute("data-theme-id")).toBe(
      screen.getByTestId("theme-id").textContent
    )
    expect(screen.getByTestId("scope-id").textContent).toBe("preview")
    expect(screen.getByTestId("source-id").textContent).toBe("base-theme")
    expect(screen.getByTestId("primary").textContent).toBe("oklch(50% 0.1 200)")
    expect(screen.getByTestId("dark-mode-enabled").textContent).toBe("true")
    expect(screen.getByTestId("dark-mode").textContent).toBe("false")
  })

  it("reflects store appearance changes on the wrapper", async () => {
    render(
      <ThemeScopeProvider
        scopeId="preview"
        overrides={{ enableDarkMode: true }}
      >
        <ScopeProbe />
      </ThemeScopeProvider>
    )

    fireEvent.click(screen.getByRole("button", { name: "Toggle dark mode" }))

    await waitFor(() => {
      expect(
        document.getElementById("preview")?.getAttribute("data-theme")
      ).toBe("dark")
    })
    expect(screen.getByTestId("dark-mode").textContent).toBe("true")
  })

  it("omits the appearance attribute when dark mode is disabled", () => {
    render(
      <ThemeScopeProvider
        scopeId="preview"
        overrides={{ enableDarkMode: false }}
      >
        <ScopeProbe />
      </ThemeScopeProvider>
    )

    expect(document.getElementById("preview")?.hasAttribute("data-theme")).toBe(
      false
    )
    expect(screen.getByTestId("dark-mode-enabled").textContent).toBe("false")
    expect(screen.getByTestId("dark-mode").textContent).toBe("unset")
  })

  it("uses top-level provider overrides as the scope's initial state", () => {
    render(
      <ThemeScopeProvider
        scopeId="preview"
        overrides={{
          primary: "oklch(65% 0.15 240)",
          enableDarkMode: true,
          isDarkMode: true,
        }}
      >
        <ScopeProbe />
      </ThemeScopeProvider>
    )

    expect(screen.getByTestId("primary").textContent).toBe(
      "oklch(65% 0.15 240)"
    )
    expect(screen.getByTestId("dark-mode").textContent).toBe("true")
  })

  it("keeps the rendered theme id stable during hydration", async () => {
    const randomUuid = vi
      .spyOn(crypto, "randomUUID")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000001")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000002")
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    const element = (
      <ThemeScopeProvider scopeId="root">
        <span>Hydrated content</span>
      </ThemeScopeProvider>
    )
    const container = document.createElement("div")
    container.innerHTML = renderToString(element)
    const serverThemeId = container
      .querySelector('[data-scope-id="root"]')
      ?.getAttribute("data-theme-id")

    let root: ReturnType<typeof hydrateRoot> | undefined
    await act(async () => {
      root = hydrateRoot(container, element)
    })

    expect(
      container
        .querySelector('[data-scope-id="root"]')
        ?.getAttribute("data-theme-id")
    ).toBe(serverThemeId)
    expect(consoleError).not.toHaveBeenCalled()

    await act(async () => root?.unmount())
    randomUuid.mockRestore()
    consoleError.mockRestore()
  })

  it("rehydrates persisted state through the supplied storage adapter", async () => {
    const persisted = JSON.stringify({
      state: {
        id: "persisted-theme-id",
        overrides: { primary: "oklch(70% 0.1 220)" },
        enableDarkMode: true,
        isDarkMode: true,
      },
      version: 1,
    })
    const { storage } = createMemoryStorage({
      [getScopeStorageKey("preview")]: persisted,
    })

    render(
      <ThemeScopeProvider
        scopeId="preview"
        overrides={{ enableDarkMode: true }}
        options={{ storage }}
      >
        <ScopeProbe />
      </ThemeScopeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("theme-id").textContent).toBe(
        "persisted-theme-id"
      )
      expect(screen.getByTestId("dark-mode").textContent).toBe("true")
    })

    expect(document.getElementById("preview")?.getAttribute("data-theme")).toBe(
      "dark"
    )
    expect(screen.getByTestId("primary").textContent).toBe("oklch(70% 0.1 220)")
    expect(storage.getItem).toHaveBeenCalledWith(getScopeStorageKey("preview"))
  })

  it("applies compiled CSS variables to a non-root scope element", async () => {
    const cssVariables = {
      "--primary": "oklch(70% 0.1 220)",
      "--accent": "oklch(60% 0.1 210)",
    }
    mockedUseThemeCompilation.mockReturnValue({
      cssVariables,
    } as unknown as ReturnType<typeof useThemeCompilation>)

    render(
      <ThemeScopeProvider scopeId="preview">
        <span>Scoped content</span>
      </ThemeScopeProvider>
    )

    const scope = document.getElementById("preview")
    await waitFor(() => {
      expect(mockedApplyCssToElement).toHaveBeenCalledWith(scope, cssVariables)
    })
  })

  it("applies compiled CSS variables to the document element for the root scope", async () => {
    const cssVariables = { "--primary": "oklch(70% 0.1 220)" }
    mockedUseThemeCompilation.mockReturnValue({
      cssVariables,
    } as unknown as ReturnType<typeof useThemeCompilation>)

    render(
      <ThemeScopeProvider scopeId="root">
        <span>Root content</span>
      </ThemeScopeProvider>
    )

    await waitFor(() => {
      expect(mockedApplyCssToElement).toHaveBeenCalledWith(
        document.documentElement,
        cssVariables
      )
    })
  })

  it("keeps sibling scope stores isolated", async () => {
    render(
      <>
        <ThemeScopeProvider
          scopeId="first"
          overrides={{ enableDarkMode: true }}
        >
          <ScopeProbe />
        </ThemeScopeProvider>
        <ThemeScopeProvider
          scopeId="second"
          overrides={{ enableDarkMode: true }}
        >
          <ScopeProbe />
        </ThemeScopeProvider>
      </>
    )

    const toggles = screen.getAllByRole("button", { name: "Toggle dark mode" })
    fireEvent.click(toggles[0]!)

    await waitFor(() => {
      expect(document.getElementById("first")?.getAttribute("data-theme")).toBe(
        "dark"
      )
    })
    expect(document.getElementById("second")?.getAttribute("data-theme")).toBe(
      "light"
    )
  })
})
