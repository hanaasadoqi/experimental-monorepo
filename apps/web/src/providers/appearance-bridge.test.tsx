import { describe, it, expect, vi, beforeEach } from "vitest"
import { render } from "@testing-library/react"
import { createMatchMediaMock } from "@repo/foundation-test-mocks/browser"
import { AppearanceBridge } from "./appearance-bridge"

const mockSetPreference = vi.fn()
let mockPreference: "light" | "dark" | "system" = "system"
let capturedOnAppearanceChange: ((next: "light" | "dark") => void) | undefined

const { matchMedia: mockMatchMedia } = createMatchMediaMock(false)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: mockMatchMedia,
})

vi.mock("@repo/runtime-preferences", () => ({
  useAppearancePreference: () => mockPreference,
  useSetAppearancePreference: () => mockSetPreference,
}))

vi.mock("@repo/runtime-theme", () => ({
  resolveAppearance: (
    preference: "light" | "dark" | "system",
    systemAppearance: "light" | "dark"
  ) => (preference === "system" ? systemAppearance : preference),
}))

vi.mock("@repo/adapters-theme-browser", () => ({
  useSystemAppearance: () => "light",
  applyAppearanceToDocument: (appearance: string) => {
    // Mock implementation that applies theme to document root
    document.documentElement.dataset.theme = appearance
    if (appearance === "dark") {
      document.documentElement.classList.add("dark")
    } else if (appearance === "light") {
      document.documentElement.classList.remove("dark")
    }
  },
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
    document.documentElement.className = "font-variable antialiased"
    mockSetPreference.mockClear()
    mockPreference = "system"
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

  it("applies the appearance to the document element", () => {
    mockPreference = "dark"
    const { container } = render(
      <AppearanceBridge>
        <div>child</div>
      </AppearanceBridge>
    )

    // AppearanceBridge now returns a fragment, so the child goes directly into container
    expect(container.textContent).toContain("child")

    // Theme is applied to the document root via RootAppearanceSync
    expect(document.documentElement.dataset.theme).toBe("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.classList.contains("font-variable")).toBe(
      true
    )
    expect(document.documentElement.classList.contains("antialiased")).toBe(
      true
    )
  })
})
