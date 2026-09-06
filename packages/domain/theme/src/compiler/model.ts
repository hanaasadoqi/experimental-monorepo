import { ColorHarmony, OklchString } from "../colors/utils"
import { ThemeDefColors } from "../definition"

export interface ThemeCompilationInput {
  isDarkMode?: boolean
  enableDarkMode?: boolean
  customAccent?: boolean
  primary: OklchString
  accent?: OklchString
  harmony?: ColorHarmony
}

export interface ResolvedTheme {
  isDarkMode?: boolean
  colors: ThemeDefColors
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
