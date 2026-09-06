import { describe, expect, it } from "vitest"

import { enumCookieCodec } from "./codecs.js"

describe("enumCookieCodec", () => {
  const codec = enumCookieCodec(["light", "dark", "system"] as const)

  it("parses valid values", () => {
    expect(codec.parse("light")).toBe("light")
    expect(codec.parse("dark")).toBe("dark")
    expect(codec.parse("system")).toBe("system")
  })

  it("rejects invalid values", () => {
    expect(() => codec.parse("purple")).toThrow(TypeError)
  })

  it("serializes valid values", () => {
    expect(codec.serialize("dark")).toBe("dark")
  })
})
