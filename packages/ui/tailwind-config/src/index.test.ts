import { readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"

import { compile } from "tailwindcss"
import { describe, expect, it } from "vitest"

const require = createRequire(import.meta.url)

const stylesheet = `
  @import "./index.css";
`

const scales = ["default", "primary", "secondary", "accent"]
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
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

async function loadStylesheet(id: string, base: string) {
  const specifier = id === "tailwindcss" ? "tailwindcss/index.css" : id
  const filePath =
    id === "tw-animate-css"
      ? path.resolve(base, "../node_modules/tw-animate-css/dist/tw-animate.css")
      : specifier.startsWith(".")
        ? require.resolve(path.resolve(base, specifier))
        : require.resolve(specifier, { paths: [base] })

  return {
    base: path.dirname(filePath),
    content: await readFile(filePath, "utf8"),
    path: filePath,
  }
}

describe("Tailwind design-system adapter", () => {
  it("compiles text utilities from runtime design-system controls", async () => {
    const compiler = await compile(stylesheet, {
      base: import.meta.dirname,
      loadStylesheet,
    })
    const css = compiler.build(sizes.map((size) => `text-${size}`))

    expect(css).toContain("font-size: var(--font-size-xs)")
    expect(css).toContain("font-size: var(--font-size-base-scaled)")
    expect(css).toContain(
      "line-height: var(--tw-leading, var(--font-line-height-xs))"
    )
    expect(css).toContain(
      "letter-spacing: var(--tw-tracking, var(--font-letter-spacing-xs))"
    )
  })

  it("maps every primitive palette step", async () => {
    const compiler = await compile(stylesheet, {
      base: import.meta.dirname,
      loadStylesheet,
    })
    const candidates = scales.flatMap((scale) =>
      steps.map((step) => "bg-" + scale + "-" + step)
    )
    const css = compiler.build(candidates)

    for (const scale of scales) {
      for (const step of steps) {
        expect(css).toContain(
          "background-color: var(--" + scale + "-" + step + ")"
        )
      }
    }
  })

  it("maps semantic colors directly to design-system roles", async () => {
    const compiler = await compile(stylesheet, {
      base: import.meta.dirname,
      loadStylesheet,
    })
    const css = compiler.build([
      "bg-background",
      "text-foreground",
      "bg-primary",
      "text-primary-foreground",
      "border-border",
      "ring-ring",
    ])

    expect(css).toContain("background-color: var(--ds-color-background)")
    expect(css).toContain("color: var(--ds-color-foreground)")
    expect(css).toContain("background-color: var(--ds-color-primary)")
    expect(css).toContain("color: var(--ds-color-primary-foreground)")
    expect(css).toContain("border-color: var(--ds-color-border)")
  })

  it("maps every text utility with its companions", async () => {
    const compiler = await compile(stylesheet, {
      base: import.meta.dirname,
      loadStylesheet,
    })
    const css = compiler.build(sizes.map((size) => "text-" + size))

    for (const size of sizes) {
      const fontSize =
        size === "base" ? "--font-size-base-scaled" : "--font-size-" + size
      expect(css).toContain("font-size: var(" + fontSize + ")")
      expect(css).toContain("var(--font-line-height-" + size + ")")
      expect(css).toContain("var(--font-letter-spacing-" + size + ")")
    }
  })

  it("supports both explicit dark selectors", async () => {
    const compiler = await compile(stylesheet, {
      base: import.meta.dirname,
      loadStylesheet,
    })
    const css = compiler.build(["dark:bg-background"])

    expect(css).toContain(".dark")
    expect(css).toMatch(/\[data-theme="?dark"?\]/)
  })
})
