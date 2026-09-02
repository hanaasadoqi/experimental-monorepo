import type { AppearancePreference } from "@repo/domain-persistence/model"
import type { ThemeMode } from "../theme/model"

export function resolveAppearance(
  preference: AppearancePreference,
  systemAppearance: ThemeMode
): ThemeMode {
  return preference === "system" ? systemAppearance : preference
}
