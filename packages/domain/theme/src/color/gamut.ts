import { clampChroma, displayable } from "culori"

import {
  MAX_CHROMA,
  MAX_HUE,
  MAX_LIGHTNESS,
  MIN_CHROMA,
  MIN_LIGHTNESS,
} from "./constants"
import type { Oklch } from "./model"

/* -------------------------------------------------------------------------- */
/* Channel clamping                                                           */
/* -------------------------------------------------------------------------- */

export const clampL = (l: number) =>
  Math.min(MAX_LIGHTNESS, Math.max(MIN_LIGHTNESS, l))

export const clampC = (c: number) =>
  Math.min(MAX_CHROMA, Math.max(MIN_CHROMA, c))

/** Hue wraps rather than clamps — 370deg is 10deg, not 360deg. */
export const clampH = (h: number) => {
  const wrapped = h % MAX_HUE
  return wrapped < 0 ? wrapped + MAX_HUE : wrapped
}

/* -------------------------------------------------------------------------- */
/* sRGB gamut                                                                 */
/* -------------------------------------------------------------------------- */

export function isInSrgbGamut({ l, c, h }: Oklch): boolean {
  return displayable({ mode: "oklch", l, c, h })
}

/** Reduce chroma until the color fits inside the sRGB gamut, preserving L and H. */
export function fitToGamut({ l, c, h }: Oklch): Oklch {
  const clamped = clampChroma({ mode: "oklch", l, c, h }, "oklch")
  return { l: clamped.l ?? l, c: clamped.c ?? 0, h: clamped.h ?? h }
}

/** Binary-search the maximum chroma that still renders inside sRGB for a given L/H. */
export function maxChromaInGamut(
  l: number,
  h: number,
  ceiling = MAX_CHROMA
): number {
  if (isInSrgbGamut({ l, c: ceiling, h })) return ceiling
  let lo = 0
  let hi = ceiling
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2
    if (isInSrgbGamut({ l, c: mid, h })) {
      lo = mid
    } else {
      hi = mid
    }
  }
  return lo
}
