import type { AppearancePreference } from "@repo/features-preferences"

import type { ResolvedAppearance } from "../domain/core/appearance"

export function resolveAppearance(
  preference: AppearancePreference,
  systemAppearance: ResolvedAppearance
): ResolvedAppearance {
  return preference === "system" ? systemAppearance : preference
}
