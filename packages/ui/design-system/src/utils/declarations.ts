import type { TokenMap } from "../types"

interface ParsedRule {
  selector: string
  declarations: TokenMap
}

/**
 * Cache for parsed CSS to avoid re-parsing identical stylesheets
 */
const CSS_PARSE_CACHE = new Map<string, readonly ParsedRule[]>()

function skipComment(css: string, start: number, end: number): number {
  const close = css.indexOf("*/", start + 2)
  if (close === -1 || close >= end) {
    throw new Error("Unclosed CSS comment")
  }
  return close + 2
}

function skipString(css: string, start: number, end: number): number {
  const quote = css[start]
  let index = start + 1

  while (index < end) {
    if (css[index] === "\\") {
      index += 2
      continue
    }
    if (css[index] === quote) return index + 1
    index += 1
  }

  throw new Error("Unclosed CSS string")
}

function findClosingBrace(css: string, open: number, end: number): number {
  let depth = 1
  let index = open + 1

  while (index < end) {
    if (css.startsWith("/*", index)) {
      index = skipComment(css, index, end)
      continue
    }
    if (css[index] === '"' || css[index] === "'") {
      index = skipString(css, index, end)
      continue
    }
    if (css[index] === "{") depth += 1
    if (css[index] === "}") {
      depth -= 1
      if (depth === 0) return index
    }
    index += 1
  }

  throw new Error("Unclosed CSS block")
}

function declarationColon(declaration: string): number {
  let parentheses = 0
  let index = 0

  while (index < declaration.length) {
    if (declaration.startsWith("/*", index)) {
      index = skipComment(declaration, index, declaration.length)
      continue
    }
    if (declaration[index] === '"' || declaration[index] === "'") {
      index = skipString(declaration, index, declaration.length)
      continue
    }
    if (declaration[index] === "(") parentheses += 1
    if (declaration[index] === ")") parentheses -= 1
    if (declaration[index] === ":" && parentheses === 0) return index
    index += 1
  }

  return -1
}

function parseDeclarations(body: string): TokenMap {
  const declarations = new Map<string, string>()
  let parentheses = 0
  let segmentStart = 0
  let index = 0

  const addDeclaration = (end: number) => {
    const declaration = body
      .slice(segmentStart, end)
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .trim()
    const colon = declarationColon(declaration)
    if (colon === -1) return

    const property = declaration.slice(0, colon).trim()
    if (!property.startsWith("--")) return

    declarations.set(property, declaration.slice(colon + 1).trim())
  }

  while (index < body.length) {
    if (body.startsWith("/*", index)) {
      index = skipComment(body, index, body.length)
      continue
    }
    if (body[index] === "\\") {
      index += 2
      continue
    }
    if (body[index] === '"' || body[index] === "'") {
      index = skipString(body, index, body.length)
      continue
    }
    if (body[index] === "(") parentheses += 1
    if (body[index] === ")") parentheses -= 1
    if (parentheses < 0) throw new Error("Unexpected closing parenthesis")
    if (body[index] === ";" && parentheses === 0) {
      addDeclaration(index)
      segmentStart = index + 1
    }
    index += 1
  }

  if (parentheses !== 0) throw new Error("Unclosed CSS function")
  addDeclaration(body.length)
  return declarations
}

function parsesNestedRules(prelude: string): boolean {
  return /^@(container|document|layer|media|scope|starting-style|supports)\b/.test(
    prelude
  )
}

function parseRules(css: string, start = 0, end = css.length): ParsedRule[] {
  const rules: ParsedRule[] = []
  let index = start

  while (index < end) {
    while (index < end && /\s/.test(css[index] ?? "")) index += 1
    if (index >= end) break
    if (css.startsWith("/*", index)) {
      index = skipComment(css, index, end)
      continue
    }
    if (css[index] === "}") throw new Error("Unexpected closing CSS block")

    const preludeStart = index
    let open = -1

    while (index < end) {
      if (css.startsWith("/*", index)) {
        index = skipComment(css, index, end)
        continue
      }
      if (css[index] === "\\") {
        index += 2
        continue
      }
      if (css[index] === '"' || css[index] === "'") {
        index = skipString(css, index, end)
        continue
      }
      if (css[index] === ";") {
        index += 1
        break
      }
      if (css[index] === "{") {
        open = index
        break
      }
      if (css[index] === "}") throw new Error("Unexpected closing CSS block")
      index += 1
    }

    if (open === -1) {
      const dangling = css.slice(preludeStart, index).trim()
      if (dangling && !dangling.endsWith(";")) {
        throw new Error(`Invalid CSS rule: ${dangling}`)
      }
      continue
    }

    const prelude = css
      .slice(preludeStart, open)
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .trim()
    const close = findClosingBrace(css, open, end)
    const body = css.slice(open + 1, close)

    if (prelude.startsWith("@")) {
      if (parsesNestedRules(prelude)) {
        rules.push(...parseRules(body))
      }
    } else if (prelude) {
      rules.push({ selector: prelude, declarations: parseDeclarations(body) })
    }

    index = close + 1
  }

  return rules
}

function parsedRules(css: string): readonly ParsedRule[] {
  const cached = CSS_PARSE_CACHE.get(css)
  if (cached) return cached

  try {
    const rules = parseRules(css)
    CSS_PARSE_CACHE.set(css, rules)
    return rules
  } catch (error) {
    throw new Error(
      `Failed to parse CSS: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? { cause: error } : undefined
    )
  }
}

/**
 * Extracts CSS declarations for a specific selector into a token map.
 * Caches parsed CSS for performance on repeated calls with same stylesheet.
 * @param css - CSS stylesheet string
 * @param selector - CSS selector to match (substring matching for flexibility)
 * @returns Map of property names to values (e.g., "--color-primary" → "#1e293b")
 * @throws Error if selector not found or CSS is invalid
 * @example
 *   const tokens = declarationsFor(":root { --primary: #1e293b; }", ":root")
 *   tokens.get("--primary") // => "#1e293b"
 */
export function declarationsFor(css: string, selector: string): TokenMap {
  const rules = parsedRules(css)
  const rule = rules.find(({ selector: candidate }) =>
    candidate.includes(selector)
  )

  if (!rule) {
    const availableSelectors = rules
      .map(({ selector: candidate }) => `"${candidate}"`)
      .join(", ")

    throw new Error(
      `Selector not found: "${selector}". Available: ${availableSelectors || "(none)"}`
    )
  }

  return new Map(rule.declarations)
}

/**
 * Clears the CSS parsing cache.
 * Use after modifying stylesheets in tests or hot-reload scenarios.
 */
export function clearDeclarationsCache(): void {
  CSS_PARSE_CACHE.clear()
}

/**
 * Extracts multiple selector declarations from the same stylesheet efficiently.
 * More performant than calling declarationsFor multiple times.
 * @param css - CSS stylesheet string
 * @param selectors - Array of selectors to extract
 * @returns Map of selector → declarations
 */
export function declarationsForSelectors(
  css: string,
  selectors: readonly string[]
): Map<string, TokenMap> {
  const rules = parsedRules(css)
  const result = new Map<string, TokenMap>()

  for (const selector of selectors) {
    const rule = rules.find(({ selector: candidate }) =>
      candidate.includes(selector)
    )

    if (rule) {
      result.set(selector, new Map(rule.declarations))
    }
  }

  return result
}
