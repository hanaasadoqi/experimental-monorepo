import type { AppearancePreference } from "@repo/feature-preferences"

import type { ResolvedAppearance } from "../model"

export function resolveAppearance(
  preference: AppearancePreference,
  systemAppearance: ResolvedAppearance
): ResolvedAppearance {
  return preference === "system" ? systemAppearance : preference
}
