import { readFile } from "node:fs/promises"
import path from "node:path"

import { wcagContrast } from "culori"
import { describe, expect, it } from "vitest"

import { declarationsFor, resolveToken } from "../utils"

const scales = ["default", "primary", "secondary", "accent"]
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
const stylesheetPath = path.join(import.meta.dirname, "../styles/colors.css")

describe("design-system colors", () => {
  it("defines every primitive scale step", async () => {
    const root = declarationsFor(
      await readFile(stylesheetPath, "utf8"),
      ":root"
    )

    for (const scale of scales) {
      for (const step of steps) {
        expect(root.has("--" + scale + "-" + step)).toBe(true)
      }
    }
  })

  it("defines collision-free light and dark semantics", async () => {
    const css = await readFile(stylesheetPath, "utf8")
    const light = declarationsFor(css, ":root")
    const dark = new Map([
      ...light,
      ...declarationsFor(css, '[data-theme="dark"]'),
    ])

    expect(light.get("--ds-color-primary")).toBe("var(--primary-700)")
    expect(light.get("--ds-color-primary-foreground")).toBe("var(--primary-50)")
    expect(dark.get("--ds-color-primary")).toBe("var(--primary-300)")
    expect(dark.get("--ds-color-primary-foreground")).toBe("var(--primary-950)")
  })

  it("resolves semantic tokens without cycles and with AA contrast", async () => {
    const css = await readFile(stylesheetPath, "utf8")
    const light = declarationsFor(css, ":root")
    const dark = new Map([
      ...light,
      ...declarationsFor(css, '[data-theme="dark"]'),
    ])
    const pairs = [
      ["--ds-color-foreground", "--ds-color-background"],
      ["--ds-color-surface-foreground", "--ds-color-surface"],
      ["--ds-color-primary-foreground", "--ds-color-primary"],
      ["--ds-color-secondary-foreground", "--ds-color-secondary"],
      ["--ds-color-muted-foreground", "--ds-color-muted"],
      ["--ds-color-accent-foreground", "--ds-color-accent"],
      ["--ds-color-destructive-foreground", "--ds-color-destructive"],
    ] as const

    for (const theme of [light, dark]) {
      for (const name of theme.keys()) {
        if (name.startsWith("--ds-color-")) {
          expect(() => resolveToken(name, theme)).not.toThrow()
        }
      }
      for (const [foreground, background] of pairs) {
        expect(
          wcagContrast(
            resolveToken(foreground, theme),
            resolveToken(background, theme)
          )
        ).toBeGreaterThanOrEqual(4.5)
      }
    }
  })
})
