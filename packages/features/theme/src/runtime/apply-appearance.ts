import type { ThemeMode } from "@repo/domain-theme";

export function applyAppearance(
  appearance: ThemeMode,
  root: HTMLElement = document.documentElement
): void {
  root.classList.toggle("dark", appearance === "dark")

  root.dataset.theme = appearance
  root.style.colorScheme = appearance
}
