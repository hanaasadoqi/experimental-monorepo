import { describe, expect, it } from "vitest"
import { stringCookieCodec } from "./codecs.js"

describe("stringCookieCodec", () => {
  it("round-trips strings", () => {
    expect(stringCookieCodec.parse("hello")).toBe("hello")

    expect(stringCookieCodec.serialize("hello")).toBe("hello")
  })
})
