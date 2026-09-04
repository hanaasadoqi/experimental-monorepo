import {
  MAX_CHROMA,
  MAX_HUE,
  fitToGamut,
  isInSrgbGamut,
  oklchToHex,
  type Oklch,
} from "@repo/domain-theme/color"
/**
 * Build a CSS `linear-gradient()` previewing how one channel varies while the
 * other two are held at the given base values. Used as the background of a
 * slider track so it reflects the current color.
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
