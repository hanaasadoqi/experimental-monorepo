import { beforeEach, describe, expect, it, vi } from "vitest"

import { POST } from "./route"
import { writeAppearanceCookie } from "@repo/adapters-theme-next/server"

vi.mock("@repo/adapters-theme-next/server", () => ({
  writeAppearanceCookie: vi.fn(),
}))

describe("POST /api/appearance-preference", () => {
  beforeEach(() => {
    vi.mocked(writeAppearanceCookie).mockReset()
  })

  it("persists a validated preference", async () => {
    const response = await POST(
      new Request("http://localhost/api/appearance-preference", {
        method: "POST",
        body: JSON.stringify({ preference: "dark" }),
      })
    )

    expect(response.status).toBe(200)
    expect(writeAppearanceCookie).toHaveBeenCalledWith("dark")
  })

  it("rejects an invalid preference", async () => {
    const response = await POST(
      new Request("http://localhost/api/appearance-preference", {
        method: "POST",
        body: JSON.stringify({ preference: "automatic" }),
      })
    )

    expect(response.status).toBe(400)
    expect(writeAppearanceCookie).not.toHaveBeenCalled()
  })

  it("reports adapter write failures", async () => {
    vi.mocked(writeAppearanceCookie).mockRejectedValue(
      new Error("request context unavailable")
    )

    const response = await POST(
      new Request("http://localhost/api/appearance-preference", {
        method: "POST",
        body: JSON.stringify({ preference: "light" }),
      })
    )

    expect(response.status).toBe(500)
  })
})
