import { TokenMap } from "../types"

/**
 * Extracts a CSS variable reference from a value.
 * Returns null if the value is a literal (not a var() reference).
 * @throws Error if the value contains 'var(' but has malformed syntax
 */
function extractTokenReference(value: string): string | null {
  // Not a reference at all - it's a literal value (e.g., #1e293b, 12px, etc.)
  if (!value.includes("var(")) {
    return null
  }

  // Malformed reference - has var( but wrong format
  const match = value.match(/^var\((--[\w-]+)\)$/)
  if (!match) {
    throw new Error(
      `Malformed CSS variable reference: "${value}". Expected format: var(--name)`
    )
  }

  return match[1] ?? null
}

/**
 * Resolves a token name to its final literal value by following CSS variable references.
 * @param name - Token name to resolve (e.g., "--ds-color-primary")
 * @param tokens - Map of token name → value pairs
 * @param visited - Set of already-visited tokens (used internally for cycle detection)
 * @returns The resolved literal value
 * @throws Error if token is missing, malformed, or contains circular references
 */
export function resolveToken(
  name: string,
  tokens: TokenMap,
  visited = new Set<string>()
): string {
  // Validate token exists
  if (!tokens.has(name)) {
    throw new Error(`Token not found: "${name}"`)
  }

  const value = tokens.get(name)
  if (value === undefined) {
    throw new Error(`Token "${name}" has undefined value`)
  }

  // Check if this token is a reference to another token
  const reference = extractTokenReference(value)

  // If it's a literal value (not a reference), we're done
  if (reference === null) {
    return value
  }

  // Check for circular reference before recursing
  if (visited.has(reference)) {
    throw new Error(
      `Circular reference detected: ${Array.from(visited).join(" → ")} → ${reference}`
    )
  }

  // Recurse to resolve the referenced token
  visited.add(name)
  return resolveToken(reference, tokens, visited)
}

/**
 * Validates that a token name exists and can be fully resolved.
 * Useful for compile-time validation of token maps.
 */
export function validateTokenExists(name: string, tokens: TokenMap): boolean {
  try {
    resolveToken(name, tokens)
    return true
  } catch {
    return false
  }
}

/**
 * Validates all tokens in a map by resolving entire dependency graph.
 * Useful for compile-time or boot-time validation of token maps.
 * @param tokens - Token map to validate
 * @returns Map of fully resolved tokens
 * @throws Error if any token is invalid or has circular references
 */
export function validateAllTokens(tokens: TokenMap): Map<string, string> {
  const resolved = new Map<string, string>()
  const errors: string[] = []

  for (const name of tokens.keys()) {
    try {
      resolved.set(name, resolveToken(name, tokens))
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
    }
  }

  if (errors.length > 0) {
    throw new Error(`Token validation failed:\n${errors.join("\n")}`)
  }

  return resolved
}
//   ["--a", "var(--b)"],
//   ["--b", "var(--a)"],
// ])
// resolveToken("--a", circular)
// Error: Circular reference detected: --a → --b → --a

// ❌ Malformed reference
// const malformed = new Map([
//   ["--bad", "var(--primary"],
// ])
// resolveToken("--bad", malformed)
// Error: Malformed CSS variable reference: "var(--primary". Expected format: var(--name)
