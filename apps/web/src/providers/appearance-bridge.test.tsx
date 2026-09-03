import { describe, it, expect, vi, beforeEach } from "vitest"
import { render } from "@testing-library/react"
import { AppearanceBridge } from "./appearance-bridge"

const mockSetPreference = vi.fn()
let mockPreference: "light" | "dark" | "system" = "system"
let mockSystemAppearance: "light" | "dark" = "light"
let capturedOnAppearanceChange: ((next: "light" | "dark") => void) | undefined

vi.mock("@repo/features-preferences", () => ({
  useAppearancePreference: () => mockPreference,
  useSetAppearancePreference: () => mockSetPreference,
}))

vi.mock("@repo/runtime-theme", () => ({
  resolveAppearance: (
    preference: "light" | "dark" | "system",
    systemAppearance: "light" | "dark"
  ) => (preference === "system" ? systemAppearance : preference),
}))

vi.mock("@repo/features-theme-react", () => ({
  useSystemAppearance: () => mockSystemAppearance,
  RootAppearanceSync: () => null,
}))

vi.mock("@repo/ui-theme", () => ({
  ThemeToggleHotkey: (props: {
    resolvedAppearance: "light" | "dark"
    onAppearanceChange: (next: "light" | "dark") => void
  }) => {
    capturedOnAppearanceChange = props.onAppearanceChange
    return null
  },
}))

describe("AppearanceBridge (app composition)", () => {
  beforeEach(() => {
    mockSetPreference.mockClear()
    mockPreference = "system"
    mockSystemAppearance = "light"
    capturedOnAppearanceChange = undefined
  })

  it("renders children", () => {
    const { getByText } = render(
      <AppearanceBridge>
        <span>child content</span>
      </AppearanceBridge>
    )
    expect(getByText("child content")).toBeTruthy()
  })

  it("passes the hotkey's requested mode through to the real preferences setter", () => {
    mockPreference = "dark"
    render(<AppearanceBridge>child</AppearanceBridge>)
    expect(capturedOnAppearanceChange).toBeDefined()
    capturedOnAppearanceChange?.("light")
    expect(mockSetPreference).toHaveBeenCalledWith("light")
  })

  it("sets the wrapper's data-theme and className to the resolved appearance", () => {
    mockPreference = "dark"
    const { container } = render(<AppearanceBridge>child</AppearanceBridge>)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.dataset.theme).toBe("dark")
    expect(wrapper.className).toBe("dark")
    expect(wrapper.style.colorScheme).toBe("")
  })
})
