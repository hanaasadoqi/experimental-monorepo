export const typography = {
  DEFAULT: {
    fontFamily: {
      mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
      sans: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji",
      serif: "Georgia, Cambria, Times New Roman, Times, serif",
    },
    fontSize: {
      base: 1,
      letterSpacing: 1.5,
      lineHeight: 1.5,
    },
  },
  semanticVars: {
    fontFamily: {
      mono: "var(--font-mono)",
      body: "var(--font-sans)",
      heading: "var(--font-serif)",
    },
    fontSize: {
      base: "var(--font-size-base)",
      letterSpacing: "var(--font-letter-spacing-base)",
      lineHeight: "var(--font-line-height-base)",
    },
  },
} as const

export type TypographyToken = typeof typography
