import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it } from "vitest"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

let container: HTMLElement | undefined

afterEach(() => {
  container?.remove()
  container = undefined
})

describe("Card", () => {
  it("composes each card region and forwards DOM properties", () => {
    container = document.createElement("div")
    document.body.append(container)

    act(() =>
      createRoot(container!).render(
        <Card aria-label="Account" className="custom-card" size="sm">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your profile</CardDescription>
            <CardAction>Action</CardAction>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )
    )

    const card = container.querySelector('[data-slot="card"]')
    expect(card?.getAttribute("aria-label")).toBe("Account")
    expect(card?.getAttribute("data-size")).toBe("sm")
    expect(card?.classList.contains("custom-card")).toBe(true)

    for (const slot of [
      "card-header",
      "card-title",
      "card-description",
      "card-action",
      "card-content",
      "card-footer",
    ]) {
      expect(container.querySelector(`[data-slot="${slot}"]`)).not.toBeNull()
    }
  })
})
