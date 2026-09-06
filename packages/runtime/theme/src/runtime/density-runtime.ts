import type { DensityMode } from "@repo/domain-theme/density"
import { DEFAULT_DENSITY, DENSITY_MODES } from "@repo/domain-theme/density"

export interface DensityTarget {
  getAttribute(name: string): string | null
  setAttribute(name: string, value: string): void
}

export function applyDensity(mode: DensityMode, target: DensityTarget): void {
  if (mode === DEFAULT_DENSITY) {
    target.setAttribute("data-density", "default")
  } else {
    target.setAttribute("data-density", mode)
  }
}

export function getDensity(target: DensityTarget): DensityMode {
  const mode = target.getAttribute("data-density") as DensityMode | null
  if (!mode || !DENSITY_MODES.includes(mode)) return DEFAULT_DENSITY
  return mode
}
