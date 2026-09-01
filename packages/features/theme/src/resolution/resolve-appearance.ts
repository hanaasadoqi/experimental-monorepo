import type { AppearancePreference } from "@repo/features-preferences"
import type { ThemeMode } from "@workspace/domain-theme"

export function resolveAppearance(
  preference: AppearancePreference,
  systemAppearance: ThemeMode
): ThemeMode {
  return preference === "system" ? systemAppearance : preference
}
