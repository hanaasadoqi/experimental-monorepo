import { MAX_CHROMA, MAX_HUE } from "./constants"
import { oklchToHex } from "./convert"
import { fitToGamut, isInSrgbGamut } from "./gamut"
import type { Oklch } from "./model"

/**
 * Build a CSS `linear-gradient()` previewing how one channel varies while the
 * other two are held at the given base values. Used as the background of a
 * slider track so it reflects the current color.
 *
 * NOTE: this is the one function here that emits presentation markup rather
 * than color data. It currently has no consumers; if a UI package starts
 * needing it, that is the better home for it.
 */
export function buildChannelGradient(
  channel: "l" | "c" | "h",
  base: Oklch,
  steps = 16
): string {
  const stops: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    let color: Oklch
    if (channel === "l") {
      color = { l: t, c: base.c, h: base.h }
    } else if (channel === "c") {
      color = { l: base.l, c: t * MAX_CHROMA, h: base.h }
    } else {
      color = { l: base.l, c: base.c, h: t * MAX_HUE }
    }
    const fitted = isInSrgbGamut(color) ? color : fitToGamut(color)
    stops.push(oklchToHex(fitted))
  }
  return `linear-gradient(to right, ${stops.join(", ")})`
}
