export function convertTokensToCSS(tokens: Record<string, string>): string {
  return Object.entries(tokens)
    .map(([key, value]) => `--${key}: ${value};`)
    .join("\n")
}
