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
 * NOTE: this is re-exported from `@repo/features-preferences`, which is a
 * layering inversion — a domain package should not depend on a feature package.
 * The fix is to extract it into `@repo/domain-persistence` (see
 * `.docs/audits/2026-09-02-theme-layering-audit.md`, Step 2). That means a new
 * package, so it is deliberately out of scope here. Re-exporting keeps exactly
 * one definition in the repo in the meantime.
 */
export {
  appearancePreferenceSchema,
  DEFAULT_APPEARANCE_PREFERENCE,
  type AppearancePreference,
} from "@repo/features-preferences/model"
