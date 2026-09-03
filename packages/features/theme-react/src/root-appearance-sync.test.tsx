import { describe, it, expect, vi, beforeEach } from "vitest"
import { render } from "@testing-library/react"
import { RootAppearanceSync } from "./root-appearance-sync"

vi.mock("@repo/runtime-theme", () => ({
  applyAppearance: vi.fn(),
}))

import { applyAppearance } from "@repo/runtime-theme"

// Proves ORCHESTRATION ONLY — that RootAppearanceSync calls applyAppearance
// with its prop, on mount and on change. Does not prove applyAppearance
// mutates the DOM — see apply-appearance.test.ts for that.
describe("RootAppearanceSync orchestration", () => {
  beforeEach(() => {
    vi.mocked(applyAppearance).mockClear()
  })

  it("calls applyAppearance with the appearance prop on mount", () => {
    render(<RootAppearanceSync appearance="dark" />)
    expect(applyAppearance).toHaveBeenCalledWith("dark")
  })

  it("calls applyAppearance again when the appearance prop changes", () => {
    const { rerender } = render(<RootAppearanceSync appearance="light" />)
    expect(applyAppearance).toHaveBeenLastCalledWith("light")
    rerender(<RootAppearanceSync appearance="dark" />)
    expect(applyAppearance).toHaveBeenLastCalledWith("dark")
  })

  it("renders no visual output", () => {
    const { container } = render(<RootAppearanceSync appearance="dark" />)
    expect(container.firstChild).toBeNull()
  })
})
