

export function resolveAppearance(
  preference: AppearancePreference,
  systemAppearance: ThemeMode
): ThemeMode {
  return preference === "system" ? systemAppearance : preference
}
