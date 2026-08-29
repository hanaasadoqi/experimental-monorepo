import { readFile } from "node:fs/promises"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { declarationsFor } from "../utils/declarations"

const sizes = [
  "xs",
  "sm",
  "base",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
  "6xl",
  "7xl",
  "8xl",
  "9xl",
]

describe("design-system typography", () => {
  it("keeps root defaults lower-specificity than application font classes", async () => {
    const css = await readFile(
      path.join(import.meta.dirname, "../styles/typography.css"),
      "utf8"
    )

    expect(css).toMatch(/:where\(\s*:root\s*\)\s*\{/)
  })

  it("defines valid stacks and approved runtime bounds", async () => {
    const css = await readFile(
      path.join(import.meta.dirname, "../styles/typography.css"),
      "utf8"
    )
    const root = declarationsFor(css, ":root")

    expect(root.get("--font-family-sans")).toContain("system-ui,")
    expect(root.get("--font-family-sans")).not.toMatch(/^".*,"$/)
    expect(root.get("--font-size-scale-min")).toBe("0.75")
    expect(root.get("--font-size-scale-max")).toBe("2")
    expect(root.get("--font-line-height-scale-min")).toBe("0.9")
    expect(root.get("--font-line-height-scale-max")).toBe("1.2")
    expect(root.get("--font-letter-spacing-scale-min")).toBe("0")
    expect(root.get("--font-letter-spacing-scale-max")).toBe("1.5")
  })

  it("defines every size with leading and tracking", async () => {
    const css = await readFile(
      path.join(import.meta.dirname, "../styles/typography.css"),
      "utf8"
    )
    const root = declarationsFor(css, ":root")

    for (const size of sizes) {
      const fontSize =
        size === "base" ? "--font-size-base-scaled" : "--font-size-" + size
      expect(root.has(fontSize)).toBe(true)
      expect(root.has("--font-line-height-" + size)).toBe(true)
      expect(root.has("--font-letter-spacing-" + size)).toBe(true)
    }
  })
})
