import type {
  AppearancePreference,
  ResolvedAppearancePreference,
} from "@repo/domain-preferences"

export function resolveAppearance(
  preference: AppearancePreference,
  systemAppearance?: ResolvedAppearancePreference
): ResolvedAppearancePreference {
  return preference === "system" ? (systemAppearance ?? "light") : preference
}
