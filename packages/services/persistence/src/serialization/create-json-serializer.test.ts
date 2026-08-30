import { describe, expect, it } from "vitest"

import { PersistenceError } from "../errors/persistence-error.js"
import { createJsonSerializer } from "./create-json-serializer.js"

interface Preferences {
  appearance: "light" | "dark" | "system"
}

function parsePreferences(value: unknown): Preferences {
  if (
    typeof value !== "object" ||
    value === null ||
    !("appearance" in value) ||
    !["light", "dark", "system"].includes(String(value.appearance))
  ) {
    throw new TypeError("Invalid preferences")
  }

  return value as Preferences
}

describe("createJsonSerializer", () => {
  const serializer = createJsonSerializer({ parse: parsePreferences })

  it("round-trips validated JSON", () => {
    const value: Preferences = { appearance: "system" }
    expect(serializer.deserialize(serializer.serialize(value))).toEqual(value)
  })

  it("rejects malformed JSON", () => {
    expect(() => serializer.deserialize("{")).toThrowError(PersistenceError)
  })

  it("rejects structurally invalid JSON", () => {
    expect(() => serializer.deserialize('{"appearance":"sepia"}')).toThrowError(
      PersistenceError
    )
  })
})
