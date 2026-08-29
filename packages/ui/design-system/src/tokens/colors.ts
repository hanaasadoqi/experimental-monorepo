/**
 * Design System Color Tokens
 *
 * CSS-authoritative color definitions. These are semantic tokens
 * (e.g., "primary", "destructive") mapped to concrete values.
 * Tailwind config consumes these to generate utility classes.
 */

export type ColorScaleKey =
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950
export type ColorScale = Record<ColorScaleKey, string>
export type ResolvedAppearance = "light" | "dark"
export type AppearanceColorTokens = {
  foreground: string
  background: string
}
export type SemanticColorTokenMap = {
  DEFAULT: string
  light: AppearanceColorTokens
  dark: AppearanceColorTokens
}

export type ColorTokens = {
  [key in ColorVariantKey]: {
    scale: ColorScale
    semantic: SemanticColorTokenMap
    semanticVars: SemanticColorTokenMap
  }
}

export type ColorVariantKey = "default" | "secondary" | "accent" | "primary"
const defaultColor = {
  scale: {
    50: "oklch(98.5% 0.002 247.839)",
    100: "oklch(96.7% 0.003 264.542)",
    200: "oklch(92.8% 0.006 264.531)",
    300: "oklch(87.2% 0.01 258.338)",
    400: "oklch(70.7% 0.022 261.325)",
    500: "oklch(55.1% 0.027 264.364)",
    600: "oklch(44.6% 0.03 256.802)",
    700: "oklch(37.3% 0.034 259.733)",
    800: "oklch(27.8% 0.033 256.848)",
    900: "oklch(21% 0.034 264.665)",
    950: "oklch(13% 0.028 261.692)",
  },
  semantic: {
    DEFAULT: "oklch(55.1% 0.027 264.364)",
    light: {
      foreground: "oklch(13% 0.028 261.692)",
      background: "oklch(98.5% 0.002 247.839)",
    },
    dark: {
      foreground: "oklch(98.5% 0.002 247.839)",
      background: "oklch(13% 0.028 261.692)",
    },
  },
  semanticVars: {
    DEFAULT: "var(--default-500)",
    light: {
      foreground: "var(--default-950)",
      background: "var(--default-50)",
    },
    dark: {
      foreground: "var(--default-50)",
      background: "var(--default-950)",
    },
  },
}

export const colors: ColorTokens = {
  default: defaultColor,
  secondary: defaultColor,
  accent: defaultColor,
  primary: {
    scale: {
      50: "oklch(98.4% 0.014 180.72)",
      100: "oklch(95.3% 0.051 180.801)",
      200: "oklch(91% 0.096 180.426)",
      300: "oklch(85.5% 0.138 181.071)",
      400: "oklch(77.7% 0.152 181.912)",
      500: "oklch(70.4% 0.14 182.503)",
      600: "oklch(60% 0.118 184.704)",
      700: "oklch(51.1% 0.096 186.391)",
      800: "oklch(43.7% 0.078 188.216)",
      900: "oklch(38.6% 0.063 188.416)",
      950: "oklch(27.7% 0.046 192.524)",
    },
    semantic: {
      DEFAULT: "oklch(70.4% 0.14 182.503)",
      light: {
        foreground: "oklch(27.7% 0.046 192.524)",
        background: "oklch(98.4% 0.014 180.72)",
      },
      dark: {
        foreground: "oklch(98.4% 0.014 180.72)",
        background: "oklch(27.7% 0.046 192.524)",
      },
    },
    semanticVars: {
      DEFAULT: "var(--primary-500)",
      light: {
        foreground: "var(--primary-950)",
        background: "var(--primary-50)",
      },
      dark: {
        foreground: "var(--primary-50)",
        background: "var(--primary-950)",
      },
    },
  },
} as const

export type ColorToken = typeof colors
