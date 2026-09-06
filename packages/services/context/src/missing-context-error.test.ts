import { describe, expect, it } from "vitest"

import { MissingContextError } from "./missing-context-error"

describe("MissingContextError", () => {
  it("creates an error with the correct name", () => {
    const error = new MissingContextError("TestContext")
    expect(error.name).toBe("MissingContextError")
  })

  it("creates an error with a helpful message", () => {
    const error = new MissingContextError("ThemeContext")
    expect(error.message).toBe(
      "ThemeContext is unavailable. Ensure the component is rendered within its provider."
    )
  })

  it("includes the context name in the message", () => {
    const contextName = "PreferencesContext"
    const error = new MissingContextError(contextName)
    expect(error.message).toContain(contextName)
  })

  it("is an instance of Error", () => {
    const error = new MissingContextError("SomeContext")
    expect(error).toBeInstanceOf(Error)
  })

  it("has a proper stack trace", () => {
    const error = new MissingContextError("TestContext")
    expect(error.stack).toBeDefined()
    expect(error.stack).toContain("MissingContextError")
  })

  it("can be caught as Error", () => {
    const error = new MissingContextError("TestContext")
    expect(() => {
      throw error
    }).toThrow(MissingContextError)
  })

  it("can be caught with message check", () => {
    const error = new MissingContextError("MyContext")
    expect(() => {
      throw error
    }).toThrow("MyContext is unavailable")
  })
})
