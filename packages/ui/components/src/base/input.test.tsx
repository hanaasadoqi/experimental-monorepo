import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Input } from "./input"

let container: HTMLElement | undefined

afterEach(() => {
  container?.remove()
  container = undefined
})

describe("Input", () => {
  it("forwards native input properties", () => {
    container = document.createElement("div")
    document.body.append(container)

    act(() =>
      createRoot(container!).render(
        <Input
          aria-label="Email"
          className="custom-input"
          disabled
          name="email"
          type="email"
        />
      )
    )

    const input = container.querySelector("input")
    expect(input?.getAttribute("aria-label")).toBe("Email")
    expect(input?.name).toBe("email")
    expect(input?.type).toBe("email")
    expect(input?.disabled).toBe(true)
    expect(input?.dataset.slot).toBe("input")
    expect(input?.classList.contains("custom-input")).toBe(true)
  })

  it("reports user input through onChange", () => {
    const onChange = vi.fn()
    container = document.createElement("div")
    document.body.append(container)

    act(() => createRoot(container!).render(<Input onChange={onChange} />))

    const input = container.querySelector("input")!
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )!.set!

    act(() => {
      nativeInputValueSetter.call(input, "hello@example.com")
      input.dispatchEvent(new Event("input", { bubbles: true }))
    })

    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange.mock.calls[0][0].target.value).toBe("hello@example.com")
  })
})
