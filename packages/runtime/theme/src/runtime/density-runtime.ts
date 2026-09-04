import type { DensityMode } from "@repo/domain-theme/density"
import { DEFAULT_DENSITY, DENSITY_MODES } from "@repo/domain-theme/density"

export function applyDensityToDocument(mode: DensityMode): void {
  if (typeof document === "undefined") return
  if (mode === DEFAULT_DENSITY) {
    document.body.setAttribute("data-density", "default")
  } else {
    document.body.setAttribute("data-density", mode)
  }
}

export function getDensityFromDocument(): DensityMode {
  if (typeof document === "undefined") return DEFAULT_DENSITY
  const mode = document.body.getAttribute("data-density") as DensityMode | null
  if (!mode || !DENSITY_MODES.includes(mode)) return DEFAULT_DENSITY
  return mode
}
