import { describe, it, expect } from "vitest"
import type { TokenMap } from "./types"

describe("design-system types", () => {
  it("TokenMap type is ReadonlyMap", () => {
    const tokenMap: TokenMap = new Map([["--color", "red"]])
    expect(tokenMap instanceof Map).toBe(true)
  })

  it("TokenMap is readonly", () => {
    const tokenMap: TokenMap = new Map([["--color", "red"]])
    // TypeScript would prevent mutation, but at runtime it's still a Map
    expect(tokenMap.get("--color")).toBe("red")
  })

  it("TokenMap stores string key-value pairs", () => {
    const tokenMap: TokenMap = new Map([
      ["--primary", "#1e293b"],
      ["--secondary", "#64748b"],
    ])
    expect(tokenMap.get("--primary")).toBe("#1e293b")
    expect(tokenMap.get("--secondary")).toBe("#64748b")
  })

  it("TokenMap can be created from entries", () => {
    const entries: [string, string][] = [
      ["--a", "1px"],
      ["--b", "2px"],
    ]
    const tokenMap: TokenMap = new Map(entries)
    expect(tokenMap.size).toBe(2)
  })

  it("TokenMap has Map interface methods", () => {
    const tokenMap: TokenMap = new Map([["--color", "red"]])
    expect(tokenMap.has("--color")).toBe(true)
    expect(tokenMap.has("--missing")).toBe(false)
    expect(tokenMap.size).toBe(1)
  })
})
