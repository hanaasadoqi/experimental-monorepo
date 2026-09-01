import { readFile } from "node:fs/promises"
import path from "node:path"

import { describe, expect, it } from "vitest"

const stylesheetPath = path.join(import.meta.dirname, "shadcn.css")
const designSystemColorsPath = path.resolve(
  import.meta.dirname,
  "../../../../design-system/src/styles/colors.css"
)

function declarationsForRule(css: string, selector: string) {
  const selectorStart = css.indexOf(selector)
  if (selectorStart === -1) throw new Error(`Missing selector: ${selector}`)
  const open = css.indexOf("{", selectorStart)
  if (open === -1) throw new Error(`Missing block for selector: ${selector}`)

  let depth = 1
  let close = open + 1
  while (close < css.length && depth > 0) {
    if (css[close] === "{") depth += 1
    if (css[close] === "}") depth -= 1
    close += 1
  }
  if (depth !== 0) throw new Error(`Unclosed block for selector: ${selector}`)

  return new Map(
    Array.from(
      css.slice(open + 1, close - 1).matchAll(/(--[\w-]+):\s*([^;]+);/g)
    ).map(([, name = "", value = ""]) => [name, value.trim()] as const)
  )
}

function resolveAlias(
  name: string,
  tokens: ReadonlyMap<string, string>,
  visited = new Set<string>()
): string {
  if (visited.has(name)) throw new Error(`Token cycle: ${name}`)
  const value = tokens.get(name)
  if (!value) throw new Error(`Missing token: ${name}`)
  const reference = value.match(/^var\((--[\w-]+)\)$/)?.[1]
  return reference
    ? resolveAlias(reference, tokens, new Set(visited).add(name))
    : value
}

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

  it("resolves every alias without missing tokens or indirect cycles", async () => {
    const [componentCss, designSystemCss] = await Promise.all([
      readFile(stylesheetPath, "utf8"),
      readFile(designSystemColorsPath, "utf8"),
    ])
    const designSystemLight = declarationsForRule(designSystemCss, ":root")
    const designSystemDark = declarationsForRule(designSystemCss, ".dark,")
    const componentLight = declarationsForRule(componentCss, ":root")
    const componentDark = declarationsForRule(componentCss, ".dark,")
    const light = new Map([...designSystemLight, ...componentLight])
    const dark = new Map([...light, ...designSystemDark, ...componentDark])

    for (const name of componentLight.keys()) {
      expect(() => resolveAlias(name, light)).not.toThrow()
      expect(() => resolveAlias(name, dark)).not.toThrow()
    }
  })

  it("retains chart and sidebar aliases", async () => {
    const css = await readFile(stylesheetPath, "utf8")

    for (let index = 1; index <= 5; index += 1) {
      expect(css).toContain(`--chart-${index}:`)
    }
    for (const alias of [
      "sidebar",
      "sidebar-foreground",
      "sidebar-primary",
      "sidebar-primary-foreground",
      "sidebar-accent",
      "sidebar-accent-foreground",
      "sidebar-border",
      "sidebar-ring",
    ]) {
      expect(css).toContain(`--${alias}:`)
    }
  })
})
