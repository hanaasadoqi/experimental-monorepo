import { TokenMap } from "../types"

export function resolveToken(
  name: string,
  tokens: TokenMap,
  visited = new Set<string>()
): string {
  if (visited.has(name)) throw new Error("Token cycle: " + name)
  const value = tokens.get(name)
  if (!value) throw new Error("Missing token: " + name)
  const reference = value.match(/^var\((--[\w-]+)\)$/)?.[1]
  return reference
    ? resolveToken(reference, tokens, new Set(visited).add(name))
    : value
}
