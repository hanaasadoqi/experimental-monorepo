import { describe, expect, it } from "vitest"
import { defineCookie } from "./define-cookie.js"

import { enumCookieCodec } from "./codecs.js"

describe("defineCookie", () => {
  const cookie = defineCookie({
    name: "appearance",
    options: {
      path: "/",
      sameSite: "lax",
    },
    codec: enumCookieCodec([
      "light",
      "dark",
      "system",
    ] as const),
  })

  it("exposes its definition", () => {
    expect(cookie.name).toBe(
      "appearance",
    )

    expect(cookie.options).toEqual({
      path: "/",
      sameSite: "lax",
    })
  })

  it("parses through the codec", () => {
    expect(
      cookie.parse("dark"),
    ).toBe("dark")
  })

  it("safeParse returns undefined for invalid input", () => {
    expect(
      cookie.safeParse("purple"),
    ).toBeUndefined()
  })

  it("safeParse returns undefined for missing input", () => {
    expect(
      cookie.safeParse(undefined),
    ).toBeUndefined()
  })

  it("serializes through the codec", () => {
    expect(
      cookie.serialize("system"),
    ).toBe("system")
  })

  it("freezes options", () => {
    expect(
      Object.isFrozen(cookie.options),
    ).toBe(true)
  })
})
