import { readFile } from "node:fs/promises"
import path from "node:path"
import { createRequire } from "node:module"

import { compile } from "tailwindcss"
import { describe, expect, it } from "vitest"

const require = createRequire(import.meta.url)

const stylesheet = `
  @import "tailwindcss";
  @import "@repo/ui-design-system/index.css";
`

async function loadStylesheet(id: string, base: string) {
  const specifier = id === "tailwindcss" ? "tailwindcss/index.css" : id
  const filePath = specifier.startsWith(".")
    ? require.resolve(path.resolve(base, specifier))
    : require.resolve(specifier, { paths: [base] })

  return {
    base: path.dirname(filePath),
    content: await readFile(filePath, "utf8"),
    path: filePath,
  }
}

describe("design-system typography", () => {
  it("compiles text utilities that scale size, leading, and tracking from runtime controls", async () => {
    const compiler = await compile(stylesheet, {
      base: import.meta.dirname,
      loadStylesheet,
    })
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
    const css = compiler.build(sizes.map((size) => `text-${size}`))

    expect(css).toContain(
      "font-size: calc(var(--font-size-base) * var(--font-size-scale) * 0.875)"
    )
    expect(css).toContain(
      "line-height: var(--tw-leading, calc(1.4286 * var(--font-line-height-scale)))"
    )
    expect(css).toContain(
      "letter-spacing: var(--tw-tracking, calc(0em * var(--font-letter-spacing-scale)))"
    )
    expect(css).toContain(
      "letter-spacing: var(--tw-tracking, calc(-0.025em * var(--font-letter-spacing-scale)))"
    )
    expect(
      css.match(
        /font-size: calc\(var\(--font-size-base\) \* var\(--font-size-scale\)/g
      )
    ).toHaveLength(sizes.length)
    expect(css.match(/var\(--font-line-height-scale\)/g)).toHaveLength(
      sizes.length
    )
    expect(css.match(/var\(--font-letter-spacing-scale\)/g)).toHaveLength(
      sizes.length
    )
  })
})
