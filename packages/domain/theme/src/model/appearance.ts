export type ThemeMode = "light" | "dark"

export const themeModeSchema = {
  light: "light",
  dark: "dark",
} as const

export type DensityMode = "compact" | "default" | "reading"
export const DENSITY_MODES: DensityMode[] = ["compact", "default", "reading"]
export const DEFAULT_DENSITY: DensityMode = "default"
