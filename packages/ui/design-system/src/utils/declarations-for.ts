import postcss, { type Rule } from "postcss"
import { TokenMap } from "../types"

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
