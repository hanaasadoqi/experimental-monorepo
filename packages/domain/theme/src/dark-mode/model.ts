import { z } from "zod"

/**
 * A concrete, rendered appearance. Never "system" — that has already been
 * resolved by the time a `ThemeMode` exists.
 */
export type ThemeMode = "light" | "dark"

export const enableDarkModeSchema = z.object({
  enableDarkMode: z
    .boolean()
    .describe("Whether dark mode is enabled")
    .default(false),
})

export const darkModeSchema = z.object({
  enableDarkMode: enableDarkModeSchema.shape,
  isDarkMode: z.boolean().describe("Whether theme is dark or light").optional(),
})

export type DarkModeOptions = z.infer<typeof darkModeSchema>
export type DisabledDarkModeOptions = z.infer<typeof enableDarkModeSchema>
