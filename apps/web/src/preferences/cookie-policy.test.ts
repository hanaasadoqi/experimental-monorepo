import { describe, expect, it } from "vitest";
import { appearanceCookie } from "./cookie-policy";

describe("appearanceCookie", () => {
  it("round-trips an appearance preference", () => {
    const serialized =
      appearanceCookie.serialize(
        "system",
      )

    expect(serialized).toBe(
      "system",
    )

    expect(
      appearanceCookie.parse(
        serialized,
      ),
    ).toBe("system")
  })

  it("rejects invalid persisted values", () => {
    expect(
      appearanceCookie.safeParse(
        "purple",
      ),
    ).toBeUndefined()
  })
})
