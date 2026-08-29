import postcss, { type Rule } from "postcss"

export type TokenMap = ReadonlyMap<string, string>

export function declarationsFor(css: string, selector: string): TokenMap {
  const root = postcss.parse(css)
  const rule = root.nodes.find(
    (node): node is Rule =>
      node.type === "rule" && node.selector.includes(selector)
  )
  if (!rule) throw new Error("Missing selector: " + selector)

  const tokens = new Map<string, string>()
  rule.walkDecls((declaration) => {
    tokens.set(declaration.prop, declaration.value)
  })
  return tokens
}

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

function luminance(value: string): number {
  const match = value.match(/^oklch\(([\d.]+)(%)?\s+([\d.]+)\s+([\d.]+)\)$/)
  if (!match) throw new Error("Unsupported color: " + value)

  const lightness = Number(match[1]) / (match[2] ? 100 : 1)
  const chroma = Number(match[3])
  const hue = (Number(match[4]) * Math.PI) / 180
  const a = chroma * Math.cos(hue)
  const b = chroma * Math.sin(hue)
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((channel) => Math.max(0, Math.min(1, channel)))

  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!
}

export function contrastRatio(foreground: string, background: string): number {
  const first = luminance(foreground)
  const second = luminance(background)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}
