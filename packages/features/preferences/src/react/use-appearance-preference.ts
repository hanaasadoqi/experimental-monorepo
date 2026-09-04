"use client"

import type { AppearancePreference } from "../model"

import { usePreferencesStore } from "./use-preferences-store"

export function useAppearancePreference(): AppearancePreference {
  return usePreferencesStore((state) => state.appearance)
}

export function resolveModeFromAppearancePreference(
  appearancePreference: AppearancePreference,
  systemMode: "light" | "dark"
): "light" | "dark" {
  if (appearancePreference === "system") {
    // we have to check the browser's system mode to resolve the actual mode, since THAT'S what the user is actually seeing, and we want to return that value for consistency with the rest of the app (e.g. for the color editor, which needs to know what mode it's in to generate the correct shades for the current mode).
    return systemMode
  }
  return appearancePreference
}
// export function useResolvedMode() {
//   const appearancePreference = useAppearancePreference()
//   if (appearancePreference["appearance-auto"] === "system") {
//     return appearancePreference.systemMode
//   }
//   return appearancePreference.appearance
// }
