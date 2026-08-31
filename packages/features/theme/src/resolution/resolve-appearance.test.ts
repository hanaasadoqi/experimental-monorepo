import { describe, expect, it } from "vitest"

import { resolveAppearance } from "./resolve-appearance"

describe("resolveAppearance", () => {
  it.each([
    ["light", "dark", "light"],
    ["dark", "light", "dark"],
    ["system", "light", "light"],
    ["system", "dark", "dark"],
  ] as const)(
    "resolves preference %s with system appearance %s to %s",
    (preference, systemAppearance, expected) => {
      expect(resolveAppearance(preference, systemAppearance)).toBe(expected)
    }
  )
})
