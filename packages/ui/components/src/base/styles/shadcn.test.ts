import { readFile } from "node:fs/promises"
import path from "node:path"

import { describe, expect, it } from "vitest"

const stylesheetPath = path.join(import.meta.dirname, "shadcn.css")

describe("shadcn theme aliases", () => {
  it("contains only component-owned aliases", async () => {
    const css = await readFile(stylesheetPath, "utf8")
    expect(css).not.toContain("@repo/ui-design-system")
    expect(css).not.toContain("tailwindcss")
    expect(css).not.toMatch(/@(?:theme|custom-variant|source)\b/)
  })

  it("maps core aliases to semantic design tokens", async () => {
    const css = await readFile(stylesheetPath, "utf8")
    expect(css).toContain("--background: var(--ds-color-background);")
    expect(css).toContain("--primary: var(--ds-color-primary);")
    expect(css).toContain("--border: var(--ds-color-border);")
    expect(css).toContain("--input: var(--ds-color-input);")
  })

  it("contains valid, non-self-referencing declarations", async () => {
    const css = await readFile(stylesheetPath, "utf8")
    expect(css).not.toMatch(/:\s*\(var\(/)

    for (const [, name = "", value = ""] of css.matchAll(
      /(--[\w-]+):\s*([^;]+);/g
    )) {
      expect(value.trim()).not.toBe("var(" + name + ")")
    }
  })
})
