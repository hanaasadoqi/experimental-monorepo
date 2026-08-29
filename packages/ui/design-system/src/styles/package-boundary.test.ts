import { readFile } from "node:fs/promises"
import path from "node:path"

import { describe, expect, it } from "vitest"

describe("design-system package boundary", () => {
  it("publishes ordinary CSS without Tailwind directives", async () => {
    const css = await readFile(
      path.join(import.meta.dirname, "index.css"),
      "utf8"
    )

    expect(css).toContain('@import "./colors.css";')
    expect(css).toContain('@import "./typography.css";')
    expect(css).not.toMatch(/@(?:theme|utility|custom-variant|source)\b/)
    expect(css).not.toContain('@import "tailwindcss"')
  })

  it("does not depend on Tailwind or PostCSS tooling", async () => {
    const manifest = JSON.parse(
      await readFile(
        path.join(import.meta.dirname, "../../package.json"),
        "utf8"
      )
    ) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }
    const dependencies = {
      ...manifest.dependencies,
      ...manifest.devDependencies,
    }

    expect(dependencies).not.toHaveProperty("tailwindcss")
    expect(dependencies).not.toHaveProperty("@tailwindcss/postcss")
    expect(dependencies).not.toHaveProperty("postcss")
  })
})
