import { writeFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Import token files
const { colors } = await import("../src/tokens/colors.ts")
const { spacing } = await import("../src/tokens/spacing.ts")
const { typography } = await import("../src/tokens/typography.ts")
const { shadows } = await import("../src/tokens/shadows.ts")
const { flattenTokens } = await import("../src/utils/flatten-tokens.ts")
const { convertTokensToCSS } = await import("../src/utils/convert-tokens-to-css.ts")

// Flatten all tokens
const flatColors = flattenTokens(colors, "color")
const flatSpacing = flattenTokens(spacing, "spacing")
const flatTypography = flattenTokens(typography, "typography")
const flatShadows = flattenTokens(shadows, "shadow")

// Combine all tokens
const allTokens = {
  ...flatColors,
  ...flatSpacing,
  ...flatTypography,
  ...flatShadows,
}

// Generate CSS
const css = `/* Design System CSS Custom Properties */
/* Generated from TypeScript token files - do not edit manually */

:root {
${convertTokensToCSS(allTokens)}
}

/* Dark Mode Overrides */
@media (prefers-color-scheme: dark) {
  :root {
    ${convertTokensToCSS(flatColors, "dark")}
  }
}

/* Explicit dark mode class override */
:root[data-theme="dark"] {
  ${convertTokensToCSS(flatColors, "dark")}
}
`

// Write to file
const outputPath = resolve(__dirname, "../src/index.css")
writeFileSync(outputPath, css, "utf-8")
console.info(`✓ Generated ${outputPath}`)
