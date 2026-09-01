import { describe, it, expect } from "vitest"
import { cn, readCookie } from "./index"

describe("shared-utils main barrel export", () => {
  describe("classnames export", () => {
    it("exports cn function", () => {
      expect(cn).toBeDefined()
      expect(typeof cn).toBe("function")
    })

    it("cn works correctly", () => {
      const result = cn("px-2", "py-1")
      expect(result).toContain("px-2")
      expect(result).toContain("py-1")
    })
  })

  describe("server utilities exports", () => {
    it("exports readCookie function", () => {
      expect(readCookie).toBeDefined()
      expect(typeof readCookie).toBe("function")
    })

    it("readCookie is async", () => {
      expect(readCookie.constructor.name).toBe("AsyncFunction")
    })
  })
})
