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
})
