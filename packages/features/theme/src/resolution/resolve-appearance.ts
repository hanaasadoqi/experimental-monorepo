import type { AppearancePreference } from "@repo/features-preferences"

import type { ResolvedAppearance } from "../model/colors"

export function resolveAppearance(
  preference: AppearancePreference,
  systemAppearance: ResolvedAppearance
): ResolvedAppearance {
  return preference === "system" ? systemAppearance : preference
}
