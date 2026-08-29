import { readFile } from "node:fs/promises"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { declarationsFor } from "../utils/declarations"

describe("design-system radius", () => {
  it("defines canonical radius values", async () => {
    const css = await readFile(
      path.join(import.meta.dirname, "../styles/radius.css"),
      "utf8"
    )
    const root = declarationsFor(css, ":root")

    expect(root.get("--radius")).toBe("0.625rem")
    expect(root.get("--ds-radius-sm")).toBe("calc(var(--radius) * 0.6)")
    expect(root.get("--ds-radius-md")).toBe("calc(var(--radius) * 0.8)")
    expect(root.get("--ds-radius-lg")).toBe("var(--radius)")
    expect(root.get("--ds-radius-xl")).toBe("calc(var(--radius) * 1.4)")
    expect(root.get("--ds-radius-2xl")).toBe("calc(var(--radius) * 1.8)")
    expect(root.get("--ds-radius-3xl")).toBe("calc(var(--radius) * 2.2)")
    expect(root.get("--ds-radius-4xl")).toBe("calc(var(--radius) * 2.6)")
  })
})
