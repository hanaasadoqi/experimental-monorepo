import { render } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { compile } from "@repo/domain-theme/compiler"
import type { ThemeDefinition } from "@repo/domain-theme"

import { ThemeRegistryProvider } from "../registry/theme-registry-context"
import { ScopeContext } from "./scope-context"
import { createScopeStore } from "./scope-store"
import { useThemeCompilation } from "./use-theme-compilation"

vi.mock("@repo/domain-theme/compiler", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@repo/domain-theme/compiler")>()

  return {
    ...actual,
    compile: vi.fn(actual.compile),
  }
})

const mockedCompile = vi.mocked(compile)

const sourceTheme: ThemeDefinition = {
  version: "1.0.0",
  metadata: { name: "Source theme" },
  colors: {
    primary: "oklch(40% 0.1 200)",
    accent: "oklch(60% 0.1 100)",
    harmony: "analogous",
  },
  darkMode: { isDarkMode: false },
}

function CompilationProbe() {
  useThemeCompilation()
  return null
}

describe("useThemeCompilation", () => {
  beforeEach(() => {
    mockedCompile.mockClear()
  })

  it("maps flat scope overrides and resolved appearance into compiler input", () => {
    const store = createScopeStore({
      scopeId: "preview",
      sourceId: "source",
      initialEnableDarkMode: true,
      initialIsDarkMode: false,
      initialOverrides: {
        primary: "oklch(70% 0.1 220)",
        customAccent: false,
      },
    })

    render(
      <ThemeRegistryProvider initialThemes={{ source: sourceTheme }}>
        <ScopeContext.Provider value={store}>
          <CompilationProbe />
        </ScopeContext.Provider>
      </ThemeRegistryProvider>
    )

    expect(mockedCompile).toHaveBeenCalledWith({
      primary: "oklch(70% 0.1 220)",
      accent: "oklch(60% 0.1 100)",
      customAccent: false,
      harmony: "analogous",
      enableDarkMode: true,
      isDarkMode: false,
    })
  })

  it("compiles an override-only scope without a registered source theme", () => {
    const store = createScopeStore({
      scopeId: "root",
      initialEnableDarkMode: true,
      initialIsDarkMode: true,
      initialOverrides: { primary: "oklch(55% 0.2 250)" },
    })

    render(
      <ThemeRegistryProvider initialThemes={{}}>
        <ScopeContext.Provider value={store}>
          <CompilationProbe />
        </ScopeContext.Provider>
      </ThemeRegistryProvider>
    )

    expect(mockedCompile).toHaveBeenCalledWith({
      primary: "oklch(55% 0.2 250)",
      customAccent: false,
      enableDarkMode: true,
      isDarkMode: true,
    })
  })
})
