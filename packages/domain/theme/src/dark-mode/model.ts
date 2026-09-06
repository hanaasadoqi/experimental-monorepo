import { z } from "zod"

/**
 * A concrete, rendered appearance. Never "system" — that has already been
 * resolved by the time a `ThemeMode` exists.
 */
export const darkModeSchema = z.object({
  darkMode: z.boolean().describe("Whether dark mode is enabled").optional(),
  enableDarkMode: z
    .boolean()
    .describe("Whether dark mode is enabled")
    .default(false),
})

export type darkMode = z.infer<typeof darkModeSchema.shape.darkMode>
