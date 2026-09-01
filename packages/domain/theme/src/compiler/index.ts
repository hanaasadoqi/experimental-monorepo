import {
  ThemeCompilationInput,
  ThemeCompilationResult,
} from "./types"

export * from "./types"

function normalize(input: ThemeCompilationInput): ThemeCompilationInput {
  return input
}

function derive(input: ThemeCompilationInput): ThemeCompilationInput {
  return input
}

function resolve(input: ThemeCompilationInput): ThemeCompilationInput {
  return input
}

function validate(input: ThemeCompilationInput): string[] {
  const errors: string[] = []
  if (!input.primary) errors.push("primary color is required")
  if (!input.mode) errors.push("mode (light|dark) is required")
  return errors
}

export function compileTheme(input: ThemeCompilationInput): ThemeCompilationResult {
  const errors = validate(input)

  if (errors.length > 0) {
    return {
      theme: null,
      cssVariables: {},
      report: { success: false, errors, warnings: [] },
    }
  }

  const normalized = normalize(input)
  const derived = derive(normalized)
  const resolved = resolve(derived)

  return {
    theme: {
      mode: resolved.mode,
      colors: {
        primary: resolved.primary,
        accent: resolved.accent || resolved.primary,
        neutral: resolved.neutral || { l: 0.5, c: 0, h: 0 },
        semantic: resolved.semantic || {},
      },
    },
    cssVariables: {
      "--primary": `oklch(${(resolved.primary.l * 100).toFixed(2)}% ${resolved.primary.c.toFixed(4)} ${resolved.primary.h.toFixed(2)})`,
    },
    report: { success: true, errors: [], warnings: [] },
  }
}
