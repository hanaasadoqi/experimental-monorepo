/**
 * Design System Color Tokens
 *
 * CSS-authoritative color definitions. These are semantic tokens
 * (e.g., "primary", "destructive") mapped to concrete values.
 * Tailwind config consumes these to generate utility classes.
 */

export const colors = {
  // Semantic intent colors
  primary: {
    DEFAULT: "hsl(217, 91%, 60%)",
    foreground: "hsl(210, 40%, 98%)",
  },
  secondary: {
    DEFAULT: "hsl(217, 32%, 17%)",
    foreground: "hsl(210, 40%, 96%)",
  },
  destructive: {
    DEFAULT: "hsl(0, 84%, 60%)",
    foreground: "hsl(210, 40%, 98%)",
  },

  // Neutral grays
  foreground: "hsl(217, 32%, 17%)",
  background: "hsl(0, 0%, 100%)",
  muted: {
    DEFAULT: "hsl(217, 32%, 91%)",
    foreground: "hsl(217, 12%, 43%)",
  },
  accent: {
    DEFAULT: "hsl(217, 91%, 60%)",
    foreground: "hsl(210, 40%, 98%)",
  },
  ring: "hsl(217, 91%, 60%)",

  // Input/form states
  input: "hsl(217, 32%, 91%)",
  border: "hsl(217, 32%, 91%)",

  // Dark mode variants
  dark: {
    foreground: "hsl(210, 40%, 96%)",
    background: "hsl(217, 32%, 11%)",
    muted: {
      DEFAULT: "hsl(217, 32%, 27%)",
      foreground: "hsl(217, 12%, 64%)",
    },
    input: "hsl(217, 32%, 27%)",
    border: "hsl(217, 32%, 27%)",
  },

  // Utility colors for gradients and special states
  slate: {
    900: "hsl(217, 32%, 11%)",
    50: "hsl(210, 40%, 98%)",
  },
  gray: {
    200: "hsl(217, 32%, 91%)",
    700: "hsl(217, 32%, 40%)",
  },
  red: {
    500: "hsl(0, 84%, 60%)",
  },
  blue: {
    500: "hsl(217, 91%, 60%)",
    600: "hsl(217, 100%, 50%)",
  },
} as const

export type ColorToken = typeof colors
