import { describe, expect, it } from "vitest"

import { getBrowserThemeStorage } from "./browser-storage"

describe("getBrowserThemeStorage", () => {
  it("returns localStorage in a browser environment", () => {
    expect(getBrowserThemeStorage()).toBe(window.localStorage)
  })
})
