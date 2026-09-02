import { themeFormSchema } from "@repo/domain-theme";
import { AppearancePreference } from "../model";
// import { AppearancePreference } from "../";

export type ThemeForm = ReturnType<typeof themeFormSchema.parse>

export type ThemeMode = "light" | "dark"

export function resolveAppearance(
  preference: AppearancePreference,
  systemAppearance: ThemeMode
): ThemeMode {
  return preference === "system" ? systemAppearance : preference
}
