import { afterEach, describe, expect, it, vi } from "vitest"

import { writePreferencesCookie } from "@repo/adapters-next"

import { POST } from "./route"

vi.mock("@repo/adapters-next", () => ({
  writePreferencesCookie: vi.fn(),
}))

function createRequest(body: unknown): Request {
  return new Request("http://localhost/api/preferences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

afterEach(() => vi.restoreAllMocks())

describe("POST /api/preferences", () => {
  it("persists SSR-owned preferences and accepts client-only preferences", async () => {
    vi.mocked(writePreferencesCookie).mockResolvedValue({ success: true })

    const response = await POST(
      createRequest({
        appearance: "dark",
        language: "en",
        dateFormat: "mm/dd/yyyy",
      })
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(writePreferencesCookie).toHaveBeenCalledWith({
      appearance: "dark",
      language: "en",
    })
  })

  it("rejects invalid preference values before writing cookies", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const response = await POST(createRequest({ appearance: "sepia" }))

    expect(response.status).toBe(400)
    expect(writePreferencesCookie).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ error: "Invalid preference format" })
    )
  })

  it("returns 500 when cookie persistence fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    vi.mocked(writePreferencesCookie).mockResolvedValue({
      success: false,
      error: "read-only response",
    })

    const response = await POST(createRequest({ appearance: "light" }))
    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: "Failed to save preferences",
    })
  })

  it("returns 500 for malformed JSON", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    const request = new Request("http://localhost/api/preferences", {
      method: "POST",
      body: "{",
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
    expect(writePreferencesCookie).not.toHaveBeenCalled()
  })
})
