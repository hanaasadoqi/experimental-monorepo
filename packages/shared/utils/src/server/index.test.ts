import { describe, it, expect } from "vitest"
import { readCookie } from "./read-cookie"

describe("server barrel export", () => {
  it("exports readCookie function", () => {
    expect(readCookie).toBeDefined()
    expect(typeof readCookie).toBe("function")
  })

  it("readCookie is async", () => {
    expect(readCookie.constructor.name).toBe("AsyncFunction")
  })
})
