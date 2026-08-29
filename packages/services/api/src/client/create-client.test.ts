import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import axios from "axios"

import { createApiClient } from "./create-client.js"

vi.mock("axios")

describe("createApiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("creates an API client with default options", () => {
    const mockCreate = vi.spyOn(axios, "create")
    createApiClient()

    expect(mockCreate).toHaveBeenCalledWith({
      baseURL: "/api",
      timeout: 10000,
    })
  })

  it("creates an API client with custom options", () => {
    const mockCreate = vi.spyOn(axios, "create")
    createApiClient({
      baseURL: "https://api.example.com",
      timeout: 5000,
    })

    expect(mockCreate).toHaveBeenCalledWith({
      baseURL: "https://api.example.com",
      timeout: 5000,
    })
  })

  it("makes GET requests", async () => {
    const mockGet = vi.fn().mockResolvedValue({ data: { id: 1, name: "Test" } })
    vi.mocked(axios.create).mockReturnValue({
      get: mockGet,
    } as any)

    const client = createApiClient()
    const result = await client.get("/users")

    expect(mockGet).toHaveBeenCalledWith("/users", undefined)
    expect(result).toEqual({ id: 1, name: "Test" })
  })

  it("makes POST requests", async () => {
    const mockPost = vi
      .fn()
      .mockResolvedValue({ data: { id: 1, name: "Test" } })
    vi.mocked(axios.create).mockReturnValue({
      post: mockPost,
    } as any)

    const client = createApiClient()
    const result = await client.post("/users", { name: "Test" })

    expect(mockPost).toHaveBeenCalledWith("/users", { name: "Test" }, undefined)
    expect(result).toEqual({ id: 1, name: "Test" })
  })

  it("makes PUT requests", async () => {
    const mockPut = vi
      .fn()
      .mockResolvedValue({ data: { id: 1, name: "Updated" } })
    vi.mocked(axios.create).mockReturnValue({
      put: mockPut,
    } as any)

    const client = createApiClient()
    const result = await client.put("/users/1", { name: "Updated" })

    expect(mockPut).toHaveBeenCalledWith(
      "/users/1",
      { name: "Updated" },
      undefined
    )
    expect(result).toEqual({ id: 1, name: "Updated" })
  })

  it("makes DELETE requests", async () => {
    const mockDelete = vi.fn().mockResolvedValue({ data: { success: true } })
    vi.mocked(axios.create).mockReturnValue({
      delete: mockDelete,
    } as any)

    const client = createApiClient()
    const result = await client.delete("/users/1")

    expect(mockDelete).toHaveBeenCalledWith("/users/1", undefined)
    expect(result).toEqual({ success: true })
  })

  it("passes request config to methods", async () => {
    const mockGet = vi.fn().mockResolvedValue({ data: [] })
    vi.mocked(axios.create).mockReturnValue({
      get: mockGet,
    } as any)

    const client = createApiClient()
    const config = { headers: { Authorization: "Bearer token" } }
    await client.get("/users", config)

    expect(mockGet).toHaveBeenCalledWith("/users", config)
  })
})
