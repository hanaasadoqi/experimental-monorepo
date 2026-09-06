import { converter } from "culori"
import { formatHex } from "culori"
import type { Oklch as CuloriOklch, Rgb as CuloriRgb } from "culori"

import { fitToGamut, isInSrgbGamut } from "./gamut"
import {
  type RgbObject,
  type AnyColorObject,
  type OklchColor,
  DEFAULT_OKLCH,
  DEFAULT_RGB,
} from "./model"
import { normalizeOklch } from "./normalize"

/**
 * Culori's `converter(mode)` functions require the input object to carry its
 * own `mode` field identifying which colorspace it's ALREADY in — without it,
 * culori relabels the object instead of converting (e.g. `{r,g,b}` handed to
 * `converter("oklch")` comes back as `{r,g,b,mode:'oklch'}`, not a real OKLCH
 * color). Domain objects (`RgbObject`, `OklchColor`) never carry `mode`, so it
 * must be attached here at the adapter boundary before every culori call.
 *
 * Culori also names its alpha channel `alpha`, not this package's `a` — left
 * unmapped, alpha silently disappears across every conversion.
 */
function toCulori(color: AnyColorObject): CuloriRgb | CuloriOklch {
  if ("r" in color && "g" in color && "b" in color) {
    return {
      mode: "rgb",
      r: color.r,
      g: color.g,
      b: color.b,
      ...(color.a !== undefined && { alpha: color.a }),
    }
  }
  const oklch = color as OklchColor
  return {
    mode: "oklch",
    l: oklch.l,
    c: oklch.c,
    h: oklch.h,
    ...(oklch.a !== undefined && { alpha: oklch.a }),
  }
}

function fromCuloriRgb(parsed: CuloriRgb | undefined): RgbObject | undefined {
  if (!parsed) return undefined
  return {
    r: parsed.r,
    g: parsed.g,
    b: parsed.b,
    ...(parsed.alpha !== undefined && { a: parsed.alpha }),
  }
}

/**
 * Converter API:
 *
 * Primarily for object forms; a CSS color string is also accepted since
 * culori parses those natively (used by ./parse for hex/oklch strings, which
 * don't need domain-object mode-tagging).
 *
 * Common patterns:
 *   string → parse → toOklch → operate → oklchToCss → string
 */

/** Convert any color object (or CSS color string) to RGB. */
export const toRgb = (color: AnyColorObject | string): RgbObject => {
  // Culori parses CSS color strings natively — no mode tag needed there.
  if (typeof color === "string") {
    const parsed = converter("rgb")(color) as CuloriRgb | undefined
    return fromCuloriRgb(parsed) ?? DEFAULT_RGB
  }
  const parsed = converter("rgb")(toCulori(color)) as CuloriRgb | undefined
  return fromCuloriRgb(parsed) ?? DEFAULT_RGB
}

/** Convert any color object (or CSS color string) to OKLCH (degrees form, safe to index). */
export const toOklch = (color: AnyColorObject | string): OklchColor => {
  try {
    if (typeof color === "string") {
      const parsed = converter("oklch")(color) as CuloriOklch | undefined
      return parsed
        ? normalizeOklch(mapCuloriOklchAlpha(parsed))
        : DEFAULT_OKLCH
    }
    const parsed = converter("oklch")(toCulori(color)) as
      CuloriOklch | undefined
    return parsed ? normalizeOklch(mapCuloriOklchAlpha(parsed)) : DEFAULT_OKLCH
  } catch {
    return DEFAULT_OKLCH
  }
}

/** Map culori's `alpha` field back to this package's `a` before normalizing. */
function mapCuloriOklchAlpha(parsed: CuloriOklch): Partial<OklchColor> {
  return {
    l: parsed.l,
    c: parsed.c,
    h: parsed.h ?? 0,
    ...(parsed.alpha !== undefined && { a: parsed.alpha }),
  }
}

/** Convert to hex (always works from objects). */
export const toHex = (color: AnyColorObject): string => convertHex(color)

/**
 * Convert OklchColor or RgbColor to hex, ensuring it stays in sRGB gamut.
 * Accepts any indexable color, converts to OKLCH, fits to gamut, returns hex.
 */
export function convertHex(color: AnyColorObject): string {
  if (typeof color === "string") return "#000000"

  // Always work in OKLCH for gamut operations
  const oklchColor: OklchColor =
    "l" in color && "c" in color ? (color as OklchColor) : toOklch(color)

  // Verify gamut and fit if needed
  const gamutFitted = isInSrgbGamut(oklchColor)
    ? oklchColor
    : fitToGamut(oklchColor)

  // Return as hex
  const hexResult = formatHex({
    mode: "oklch" as const,
    l: gamutFitted.l,
    c: gamutFitted.c,
    h: gamutFitted.h,
  })
  return hexResult ?? "#000000"
}

/** Convert OKLCH to hex with gamut fitting. */
export function oklchToHex(color: OklchColor): string {
  const fitted = isInSrgbGamut(color) ? color : fitToGamut(color)
  const hex = formatHex({
    mode: "oklch" as const,
    l: fitted.l,
    c: fitted.c,
    h: fitted.h,
  })
  return hex ?? "#000000"
}

/** Convert RGB to hex. */
export function rgbToHex(rgb: RgbObject): string {
  const r = Math.round((rgb.r ?? 0) * 255)
  const g = Math.round((rgb.g ?? 0) * 255)
  const b = Math.round((rgb.b ?? 0) * 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0").toUpperCase()}`
}

/** Convert RGB to OKLCH. */
export const rgbToOklch = (rgb: RgbObject): OklchColor => toOklch(rgb)

/** Convert OKLCH to RGB with gamut fitting. */
export function oklchToRgb(color: OklchColor): RgbObject {
  const fitted = isInSrgbGamut(color) ? color : fitToGamut(color)
  return toRgb({
    mode: "oklch" as const,
    l: fitted.l,
    c: fitted.c,
    h: fitted.h,
  } as OklchColor)
}

/**
 * Convert to 0-255 sRGB bytes, clamping into gamut first.
 * Used for pixel-level canvas rendering.
 */
export function oklchToRgbBytes(color: OklchColor): [number, number, number] {
  const rgb = oklchToRgb(color)
  const toByte = (n: number | undefined) =>
    Math.round(Math.min(1, Math.max(0, n ?? 0)) * 255)
  return [toByte(rgb.r), toByte(rgb.g), toByte(rgb.b)]
}

/**
 * Convert OKLCH color to CSS oklch() string.
 * Format: oklch(lightness% chroma hue)
 * Input hue must be in degrees (0-360).
 */
export function oklchToCss(color: OklchColor): string {
  return `oklch(${(color.l * 100).toFixed(1)}% ${color.c.toFixed(4)} ${color.h.toFixed(1)})`
}

/**
 * Convert RGB color to CSS rgb() or rgba() string.
 * Input should be 0-1 normalized.
 */
export function rgbToCss(color: RgbObject): string {
  const r = Math.round((color.r ?? 0) * 255)
  const g = Math.round((color.g ?? 0) * 255)
  const b = Math.round((color.b ?? 0) * 255)
  if (color.a !== undefined) {
    return `rgba(${r}, ${g}, ${b}, ${color.a.toFixed(3)})`
  }
  return `rgb(${r}, ${g}, ${b})`
}
