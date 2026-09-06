import type { ThemeMode } from "@repo/domain-theme/appearance"

export interface AppearanceTarget {
  classList: {
    toggle(className: string, force?: boolean): boolean
  }
  dataset: Record<string, string | undefined>
  style: {
    colorScheme: string
  }
}

export function applyAppearance(
  appearance: ThemeMode,
  root: AppearanceTarget
): void {
  root.classList.toggle("dark", appearance === "dark")

  root.dataset.theme = appearance
  root.style.colorScheme = appearance
}
