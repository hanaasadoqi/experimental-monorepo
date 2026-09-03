import { describe, it, expect, vi } from "vitest"
import { render } from "@testing-library/react"
import { ThemeToggleHotkey } from "./theme-toggle-hotkey"

describe("ThemeToggleHotkey", () => {
  it("renders no visual output", () => {
    const { container, unmount } = render(
      <ThemeToggleHotkey
        resolvedAppearance="dark"
        onAppearanceChange={vi.fn()}
      />
    )
    expect(container.firstChild).toBeNull()
    unmount()
  })

  it("sets up and tears down the keydown listener", () => {
    const addSpy = vi.spyOn(window, "addEventListener")
    const removeSpy = vi.spyOn(window, "removeEventListener")
    const { unmount } = render(
      <ThemeToggleHotkey
        resolvedAppearance="dark"
        onAppearanceChange={vi.fn()}
      />
    )
    expect(addSpy).toHaveBeenCalledWith("keydown", expect.any(Function))
    unmount()
    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function))
    addSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it("ignores modifier keys and repeats", () => {
    const onAppearanceChange = vi.fn()
    render(
      <ThemeToggleHotkey
        resolvedAppearance="dark"
        onAppearanceChange={onAppearanceChange}
      />
    )
    const cases: KeyboardEventInit[] = [
      { key: "d", repeat: true },
      { key: "d", metaKey: true },
      { key: "d", ctrlKey: true },
      { key: "d", altKey: true },
    ]
    cases.forEach((init) =>
      window.dispatchEvent(new KeyboardEvent("keydown", init))
    )
    expect(onAppearanceChange).not.toHaveBeenCalled()
  })

  it("ignores non-d keys", () => {
    const onAppearanceChange = vi.fn()
    render(
      <ThemeToggleHotkey
        resolvedAppearance="dark"
        onAppearanceChange={onAppearanceChange}
      />
    )
    ;["a", "Enter", " ", "Escape"].forEach((key) =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key }))
    )
    expect(onAppearanceChange).not.toHaveBeenCalled()
  })

  it("ignores 'd' when the target is a typing element", () => {
    const onAppearanceChange = vi.fn()
    render(
      <ThemeToggleHotkey
        resolvedAppearance="dark"
        onAppearanceChange={onAppearanceChange}
      />
    )
    const input = document.createElement("input")
    const event = new KeyboardEvent("keydown", { key: "d" })
    Object.defineProperty(event, "target", { value: input, writable: false })
    window.dispatchEvent(event)
    expect(onAppearanceChange).not.toHaveBeenCalled()
  })

  it("toggles dark to light, case-insensitively", () => {
    const onAppearanceChange = vi.fn()
    render(
      <ThemeToggleHotkey
        resolvedAppearance="dark"
        onAppearanceChange={onAppearanceChange}
      />
    )
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "D" }))
    expect(onAppearanceChange).toHaveBeenCalledWith("light")
  })

  it("toggles light to dark", () => {
    const onAppearanceChange = vi.fn()
    render(
      <ThemeToggleHotkey
        resolvedAppearance="light"
        onAppearanceChange={onAppearanceChange}
      />
    )
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }))
    expect(onAppearanceChange).toHaveBeenCalledWith("dark")
  })

  it("uses the current resolvedAppearance prop on re-render", () => {
    const onAppearanceChange = vi.fn()
    const { rerender } = render(
      <ThemeToggleHotkey
        resolvedAppearance="dark"
        onAppearanceChange={onAppearanceChange}
      />
    )
    rerender(
      <ThemeToggleHotkey
        resolvedAppearance="light"
        onAppearanceChange={onAppearanceChange}
      />
    )
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }))
    expect(onAppearanceChange).toHaveBeenCalledWith("dark")
  })
})
