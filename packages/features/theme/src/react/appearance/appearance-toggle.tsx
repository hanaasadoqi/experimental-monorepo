"use client"

import {
  useResolvedAppearance,
} from "./use-resolved-appearance"

import {
  useToggleAppearance,
} from "./use-toggle-appearance"

export function AppearanceToggle() {
  const appearance =
    useResolvedAppearance()

  const toggleAppearance =
    useToggleAppearance()

  return (
    <button
      type="button"
      onClick={toggleAppearance}
      aria-label={
        appearance === "dark"
          ? "Switch to light appearance"
          : "Switch to dark appearance"
      }
    >
      {appearance === "dark"
        ? "Light"
        : "Dark"}
    </button>
  )
}
