import { act, type ReactElement } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it } from "vitest"

import { Badge, badgeVariants } from "./badge"

const containers: HTMLElement[] = []

function renderBadge(badge: ReactElement) {
  const container = document.createElement("div")
  document.body.append(container)
  containers.push(container)

  act(() => createRoot(container).render(badge))

  return container.querySelector("span")
}

afterEach(() => {
  for (const container of containers.splice(0)) container.remove()
})

describe("Badge", () => {
  it("renders as a span with content", () => {
    const badge = renderBadge(<Badge>New</Badge>)!

    expect(badge.textContent).toBe("New")
    expect(badge.tagName).toBe("SPAN")
  })

  it("applies default variant classes", () => {
    const badge = renderBadge(<Badge>Default</Badge>)!

    expect(badge.classList).toContain("bg-primary")
    expect(badge.classList).toContain("text-primary-foreground")
  })

  it("applies secondary variant", () => {
    const badge = renderBadge(<Badge variant="secondary">Secondary</Badge>)!

    expect(badge.classList).toContain("bg-secondary")
    expect(badge.classList).toContain("text-secondary-foreground")
  })

  it("applies destructive variant", () => {
    const badge = renderBadge(<Badge variant="destructive">Error</Badge>)!

    expect(badge.classList).toContain("bg-destructive/10")
    expect(badge.classList).toContain("text-destructive")
  })

  it("applies outline variant", () => {
    const badge = renderBadge(<Badge variant="outline">Outline</Badge>)!

    expect(badge.classList).toContain("border-border")
    expect(badge.classList).toContain("bg-input/20")
  })

  it("applies ghost variant", () => {
    const badge = renderBadge(<Badge variant="ghost">Ghost</Badge>)!

    expect(badge.classList).toContain("hover:bg-muted")
  })

  it("applies link variant", () => {
    const badge = renderBadge(<Badge variant="link">Link</Badge>)!

    expect(badge.classList).toContain("text-primary")
    expect(badge.classList).toContain("underline-offset-4")
  })

  it("accepts custom className", () => {
    const badge = renderBadge(<Badge className="custom-class">Badge</Badge>)!

    expect(badge.classList).toContain("custom-class")
  })

  it("sets data slot attribute", () => {
    const badge = renderBadge(<Badge>Slot</Badge>)!

    expect(badge.dataset.slot).toBe("badge")
  })

  it("accepts arbitrary HTML attributes", () => {
    const badge = renderBadge(
      <Badge id="test-badge" data-testid="custom-badge">
        Custom
      </Badge>
    )!

    expect(badge.getAttribute("id")).toBe("test-badge")
    expect(badge.getAttribute("data-testid")).toBe("custom-badge")
  })

  it("supports aria attributes", () => {
    const badge = renderBadge(
      <Badge aria-label="New items available">New</Badge>
    )!

    expect(badge.getAttribute("aria-label")).toBe("New items available")
  })
})

describe("badgeVariants", () => {
  it("applies default variant classes", () => {
    const classes = badgeVariants()
    expect(classes).toContain("bg-primary")
    expect(classes).toContain("text-primary-foreground")
  })

  it("applies secondary variant", () => {
    const classes = badgeVariants({ variant: "secondary" })
    expect(classes).toContain("bg-secondary")
    expect(classes).toContain("text-secondary-foreground")
  })

  it("applies destructive variant", () => {
    const classes = badgeVariants({ variant: "destructive" })
    expect(classes).toContain("bg-destructive/10")
    expect(classes).toContain("text-destructive")
  })

  it("applies outline variant", () => {
    const classes = badgeVariants({ variant: "outline" })
    expect(classes).toContain("border-border")
    expect(classes).toContain("bg-input/20")
  })

  it("applies ghost variant", () => {
    const classes = badgeVariants({ variant: "ghost" })
    expect(classes).toContain("hover:bg-muted")
  })

  it("applies link variant", () => {
    const classes = badgeVariants({ variant: "link" })
    expect(classes).toContain("text-primary")
    expect(classes).toContain("underline-offset-4")
  })

  it("merges custom className with variants", () => {
    const classes = badgeVariants({
      variant: "destructive",
      className: "custom-badge",
    })
    expect(classes).toContain("bg-destructive/10")
    expect(classes).toContain("custom-badge")
  })

  it("includes base styles", () => {
    const classes = badgeVariants()
    expect(classes).toContain("inline-flex")
    expect(classes).toContain("items-center")
    expect(classes).toContain("rounded-full")
  })
})
