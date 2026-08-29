import { act, type ReactElement } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Button, buttonVariants } from "./button"

const containers: HTMLElement[] = []

function renderButton(button: ReactElement) {
  const container = document.createElement("div")
  document.body.append(container)
  containers.push(container)

  act(() => createRoot(container).render(button))

  return container.querySelector("button")
}

afterEach(() => {
  for (const container of containers.splice(0)) container.remove()
})

describe("Button", () => {
  it("renders an accessible button and handles activation", () => {
    const onClick = vi.fn()
    const button = renderButton(<Button onClick={onClick}>Save</Button>)

    expect(button?.textContent).toBe("Save")
    expect(button?.dataset.slot).toBe("button")

    act(() => button?.click())

    expect(onClick).toHaveBeenCalledOnce()
  })

  it("prevents activation when disabled", () => {
    const onClick = vi.fn()
    const button = renderButton(
      <Button disabled onClick={onClick}>
        Save
      </Button>
    )

    act(() => button?.click())

    expect(button?.disabled).toBe(true)
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe("buttonVariants", () => {
  it("applies requested variants and caller classes", () => {
    const classes = buttonVariants({
      variant: "destructive",
      size: "icon",
      className: "custom",
    })

    expect(classes).toContain("bg-destructive/10")
    expect(classes).toContain("size-7")
    expect(classes).toContain("custom")
  })
})
