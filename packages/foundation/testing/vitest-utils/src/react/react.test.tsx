import { screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { createTestRender } from "./create-test-render.tsx";
import { renderUi } from "./render-ui.tsx";

describe("createTestRender", () => {
  it("passes provider options to the wrapper", () => {
    const renderWithTheme = createTestRender<{ theme: string }>(
      (children: ReactNode, providers) => (
        <section data-theme={providers?.theme}>{children}</section>
      )
    )

    renderWithTheme(<span>Content</span>, {
      providers: { theme: "dark" },
    })

    expect(screen.getByText("Content").parentElement).toHaveAttribute(
      "data-theme",
      "dark"
    )
  })
  it("forwards render options to Testing Library", () => {
    const renderWithProviders = createTestRender((children: ReactNode) => (<>{children}</>))

    const container = document.createElement("main")
    document.body.append(container)

    const result = renderWithProviders(<span>Content</span>, { container })

    expect(result.container).toBe(container)
    expect(container).toHaveTextContent("Content")
  })

})

describe("renderUi", () => {
  it("renders UI without requiring provider configuration", () => {
    renderUi(<button type="button">Save</button>)

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
  })
})

