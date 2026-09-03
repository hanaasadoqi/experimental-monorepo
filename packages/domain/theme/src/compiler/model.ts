import { OklchColor, SemanticColorOverrides } from "../color/model"
import { ThemeMode } from "../appearance/model"

export interface ThemeCompilationInput {
  mode: ThemeMode
  primary: OklchColor
  accent?: OklchColor
  neutral?: OklchColor
  semantic?: SemanticColorOverrides
}

export interface ResolvedTheme {
  mode: ThemeMode
  colors: {
    primary: OklchColor
    accent: OklchColor
    neutral: OklchColor
    semantic: Record<string, OklchColor>
  }
}

export interface CssVariables {
  [key: string]: string
}

export interface ThemeCompilationReport {
  success: boolean
  errors: string[]
  warnings: string[]
}

export interface ThemeCompilationResult {
  theme: ResolvedTheme | null
  cssVariables: CssVariables
  report: ThemeCompilationReport
}
