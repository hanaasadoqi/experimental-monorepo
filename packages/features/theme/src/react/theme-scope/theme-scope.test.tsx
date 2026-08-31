import { fireEvent, render, screen, within } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { ThemeForm } from "./theme-form"
import { ThemePreview } from "./theme-preview"
import { ThemeScopeProvider } from "./theme-scope-provider"

function ScopedEditor({ scopeId }: { scopeId: string }) {
  return (
    <ThemeScopeProvider scopeId={scopeId}>
      <ThemeForm />
      <ThemePreview />
    </ThemeScopeProvider>
  )
}

describe("ThemeScopeProvider", () => {
  it("renders deterministic boundary attributes for hydration", () => {
    const renderScope = () =>
      renderToString(
        <ThemeScopeProvider scopeId="preview">
          <span>Scoped content</span>
        </ThemeScopeProvider>
      )

    expect(renderScope()).toBe(renderScope())
  })

  it("keeps two providers isolated and updates only the nearest preview", () => {
    render(
      <>
        <ScopedEditor scopeId="first" />
        <ScopedEditor scopeId="second" />
      </>
    )

    const firstScope = screen.getByTestId("theme-scope-first")
    const secondScope = screen.getByTestId("theme-scope-second")
    const firstInput = within(firstScope).getByLabelText("Primary color")

    fireEvent.change(firstInput, { target: { value: "#123456" } })

    expect(firstScope.style.getPropertyValue("--theme-primary")).toBe("#123456")
    expect(
      within(firstScope)
        .getByTestId("theme-preview")
        .getAttribute("data-primary-color")
    ).toBe("#123456")
    expect(secondScope.style.getPropertyValue("--theme-primary")).not.toBe(
      "#123456"
    )
    expect(
      within(secondScope)
        .getByTestId("theme-preview")
        .getAttribute("data-primary-color")
    ).not.toBe("#123456")
  })

  it("renders representative preview controls under the same scope", () => {
    render(<ScopedEditor scopeId="preview" />)

    const preview = screen.getByTestId("theme-preview")

    expect(
      within(preview).getByRole("button", { name: "Primary action" })
    ).toBeTruthy()
    expect(
      within(preview).getByRole("button", { name: "Secondary action" })
    ).toBeTruthy()
    expect(within(preview).getByText("Preview badge")).toBeTruthy()
    expect(
      within(preview).getByRole("textbox", { name: "Preview input" })
    ).toBeTruthy()
    expect(within(preview).getByText("Scoped surface")).toBeTruthy()
    expect(
      within(preview).getByText("Representative preview text")
    ).toBeTruthy()
  })

  it("does not apply scoped variables to the document root or outside UI", () => {
    render(
      <>
        <button type="button" data-testid="outside-control">
          Outside control
        </button>
        <ScopedEditor scopeId="preview" />
      </>
    )

    fireEvent.change(screen.getByLabelText("Primary color"), {
      target: { value: "#654321" },
    })

    expect(
      document.documentElement.style.getPropertyValue("--theme-primary")
    ).toBe("")
    expect(
      screen.getByTestId("outside-control").closest("[data-theme-scope]")
    ).toBeNull()
  })
})
