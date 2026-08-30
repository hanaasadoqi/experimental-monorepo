import { describe, it, expect } from "vitest"
import {
  generateBootstrapCode,
  generateBootstrapScript,
  resolveServerColorScheme,
} from "./appearance-bootstrap"
import type { AppearancePreference } from "../types"

describe("generateBootstrapScript", () => {
  it("exposes executable code for framework script components", () => {
    const code = generateBootstrapCode("light")

    expect(code).not.toContain("<script")
    expect(code).not.toContain("</script>")
    expect(code).toContain("data-theme")
  })

  it("generates a script for light preference", () => {
    const script = generateBootstrapScript("light")
    expect(script).toContain("<script>")
    expect(script).toContain("</script>")
    expect(script).toContain("light")
  })

  it("generates a script for dark preference", () => {
    const script = generateBootstrapScript("dark")
    expect(script).toContain("dark")
  })

  it("generates a script for system preference", () => {
    const script = generateBootstrapScript("system")
    expect(script).toContain("system")
  })

  it("escapes nonce in script tag", () => {
    const nonce = "test-nonce-123"
    const script = generateBootstrapScript("light", nonce)
    expect(script).toContain(`nonce="${nonce}"`)
  })

  it("escapes dangerous nonce characters", () => {
    const nonce = 'test"nonce'
    const script = generateBootstrapScript("light", nonce)
    expect(script).toContain("&quot;")
  })

  it("does not contain eval", () => {
    const script = generateBootstrapScript("dark")
    expect(script.toLowerCase()).not.toContain("eval")
  })

  it("script is reasonably small", () => {
    const script = generateBootstrapScript("system")
    expect(script.length).toBeLessThan(2048)
  })

  it("handles invalid preference gracefully", () => {
    const script = generateBootstrapScript(
      "invalid" as unknown as AppearancePreference
    )
    expect(script).toContain("<script>")
  })
})

describe("resolveServerColorScheme", () => {
  it("resolves light to light", () => {
    expect(resolveServerColorScheme("light")).toBe("light")
  })

  it("resolves dark to dark", () => {
    expect(resolveServerColorScheme("dark")).toBe("dark")
  })

  it("resolves system to light (server default)", () => {
    expect(resolveServerColorScheme("system")).toBe("light")
  })
})
