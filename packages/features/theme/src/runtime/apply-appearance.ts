import type { ResolvedAppearance } from "../domain/core/appearance"

export function applyAppearance(
  appearance: ResolvedAppearance,
  root: HTMLElement = document.documentElement
): void {
  root.classList.toggle("dark", appearance === "dark")

  root.dataset.theme = appearance
  root.style.colorScheme = appearance
}
