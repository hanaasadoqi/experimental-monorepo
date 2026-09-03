import type { AppearancePreference, ThemeMode } from "./model"

/**
 * Collapse a stored preference into a concrete appearance.
 *
 * This is the single implementation. `@repo/runtime-theme` re-exports it rather
 * than defining its own — a pure function belongs in the domain layer, and a
 * re-export crosses no boundary since runtime already depends on domain.
 */
export function resolveAppearance(
  preference: AppearancePreference,
  systemAppearance: ThemeMode
): ThemeMode {
  return preference === "system" ? systemAppearance : preference
}
