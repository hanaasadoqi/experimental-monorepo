import { z } from "zod"

/**
 * A concrete, rendered appearance. Never "system" — that has already been
 * resolved by the time a `ThemeMode` exists.
 */
export const themeModeSchema = z.enum(["light", "dark"])

export type ThemeMode = z.infer<typeof themeModeSchema>

/**
 * Alias for `ThemeMode`, named for the *output* side of `resolveAppearance`.
 * Kept as an alias rather than a second union so the two can never drift.
 */
export type ResolvedAppearance = ThemeMode

/**
 * The user's stored *preference*, which may defer to the OS ("system").
 *
 * The canonical definition lives in the pure preferences domain. Re-exporting
 * it here keeps the existing theme-domain appearance API compatible.
 */
export {
  appearancePreferenceSchema,
  DEFAULT_APPEARANCE_PREFERENCE,
  type AppearancePreference,
} from "@repo/domain-preferences/appearance"
