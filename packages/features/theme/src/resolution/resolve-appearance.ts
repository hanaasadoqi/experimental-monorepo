import { ThemeMode } from "@repo/domain-theme";
import { AppearancePreference } from "../domain";

export function resolveAppearance(
  preference: AppearancePreference,
  systemAppearance: ThemeMode
): ThemeMode {
  return preference === "system" ? systemAppearance : preference
}
