import { clampChroma, converter, displayable, formatHex } from "culori"

export type Oklch = {
  l: number
  c: number
  h: number
}

const toOklch = converter("oklch")
const toRgb = converter("rgb")

/** Clamp helpers */
export const clampL = (l: number) => Math.min(1, Math.max(0, l))
export const clampC = (c: number) => Math.min(0.4, Math.max(0, c))
export const clampH = (h: number) => {
  const wrapped = h % 360
  return wrapped < 0 ? wrapped + 360 : wrapped
}

export function oklchToCss({ l, c, h }: Oklch) {
  return `oklch(${round(l, 4)} ${round(c, 4)} ${round(h, 2)})`
}

export function oklchToHex({ l, c, h }: Oklch): string {
  const hex = formatHex({ mode: "oklch", l, c, h })
  return hex ?? "#000000"
}

/** Convert to 0-255 sRGB bytes, clamping into gamut first. Used for pixel-level canvas rendering. */
export function oklchToRgbBytes({ l, c, h }: Oklch): [number, number, number] {
  const fitted = isInSrgbGamut({ l, c, h }) ? { l, c, h } : fitToGamut({ l, c, h })
  const rgb = toRgb({ mode: "oklch", l: fitted.l, c: fitted.c, h: fitted.h })
  const toByte = (n: number | undefined) => Math.round(Math.min(1, Math.max(0, n ?? 0)) * 255)
  return [toByte(rgb?.r), toByte(rgb?.g), toByte(rgb?.b)]
}

/** Maximum chroma axis value used across sliders and the spectrum plane. */
export const MAX_CHROMA = 0.4

export function isInSrgbGamut({ l, c, h }: Oklch): boolean {
  return displayable({ mode: "oklch", l, c, h })
}

/** Reduce chroma until the color fits inside the sRGB gamut, preserving L and H. */
export function fitToGamut({ l, c, h }: Oklch): Oklch {
  const clamped = clampChroma({ mode: "oklch", l, c, h }, "oklch")
  return { l: clamped.l ?? l, c: clamped.c ?? 0, h: clamped.h ?? h }
}

/** Binary-search the maximum chroma that still renders inside the sRGB gamut for a given L/H. */
export function maxChromaInGamut(l: number, h: number, ceiling = 0.4): number {
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

/** Parse a hex string (#rgb, #rrggbb) into OKLCH. Returns null if invalid. */
export function hexToOklch(hex: string): Oklch | null {
  const trimmed = hex.trim()
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) return null
  const parsed = toOklch(trimmed)
  if (!parsed) return null
  return {
    l: parsed.l ?? 0,
    c: parsed.c ?? 0,
    h: parsed.h ?? 0,
  }
}

/**
 * Parse a raw string that may be:
 * - a CSS oklch() function: "oklch(0.7 0.15 250)" or "oklch(70% 0.15 250)"
 * - a bare triplet: "0.7 0.15 250"
 * - a hex color: "#3366ff"
 */
export function parseColorInput(input: string): Oklch | null {
  const raw = input.trim()
  if (!raw) return null

  if (raw.startsWith("#")) {
    return hexToOklch(raw)
  }

  const fnMatch = raw.match(/^oklch\(([^)]+)\)$/i)
  const body = fnMatch ? fnMatch[1] : raw
  const parts = body?.replace(/\//g, " ")
    .split(/[\s,]+/)
    .filter(Boolean)

  if (!parts || parts?.length < 3) return null

  const lRaw = parts[0]
  const cRaw = parts[1]
  const hRaw = parts[2]

  const l = lRaw?.endsWith("%") ? Number.parseFloat(lRaw) / 100 : Number.parseFloat(String(lRaw))
  const c = cRaw?.endsWith("%") ? (Number.parseFloat(cRaw) / 100) * 0.4 : Number.parseFloat(String(cRaw))
  const h = Number.parseFloat(String(hRaw))

  if ([l, c, h].some((n) => Number.isNaN(n))) return null

  return {
    l: clampL(l),
    c: clampC(c),
    h: clampH(h),
  }
}

export type Shade = {
  step: number
  l: number
  c: number
  h: number
  hex: string
  css: string
  inGamut: boolean
  isBase: boolean
}

const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

// Target lightness for each step, independent of the base color.
const STEP_LIGHTNESS: Record<number, number> = {
  50: 0.97,
  100: 0.93,
  200: 0.86,
  300: 0.77,
  400: 0.68,
  500: 0.58,
  600: 0.49,
  700: 0.4,
  800: 0.31,
  900: 0.23,
  950: 0.16,
}

/**
 * Generate a shade ramp from a base OKLCH color.
 * Lightness follows a fixed perceptual curve; chroma is scaled relative to
 * the base chroma using a bell curve centered on the base lightness, then
 * clamped back into the sRGB gamut so every swatch renders as a real color.
 */
export function generateShades(base: Oklch): Shade[] {
  const baseL = clampL(base.l)
  const baseC = clampC(base.c)
  const h = clampH(base.h)

  // Find the step whose target lightness is closest to the base — that
  // step will render the exact base color.
  let closestStep = SHADE_STEPS[0]
  let closestDist = Number.POSITIVE_INFINITY
  for (const step of SHADE_STEPS) {
    const dist = Math.abs((STEP_LIGHTNESS[step] ?? -1) - baseL)
    if (dist < closestDist) {
      closestDist = dist
      closestStep = step
    }
  }

  return SHADE_STEPS.map((step) => {
    const isBase = step === closestStep
    const targetL = clampL(isBase ? baseL : (STEP_LIGHTNESS[step] ?? baseL))

    // Keep the same chroma across the whole ramp and only pull it back where
    // the sRGB gamut genuinely can't hold it (naturally tapers near white/black).
    const maxC = maxChromaInGamut(targetL, h)
    const targetC = Math.min(baseC, maxC)
    const inGamut = targetC >= baseC - 1e-6

    return {
      step,
      l: targetL,
      c: targetC,
      h,
      hex: oklchToHex({ l: targetL, c: targetC, h }),
      css: oklchToCss({ l: targetL, c: targetC, h }),
      inGamut,
      isBase,
    }
  })
}

/**
 * Build a CSS linear-gradient string previewing how a channel varies while
 * the other two channels are held at the given base values. Used as the
 * background of each slider track so it always reflects the current color.
 */
export function buildChannelGradient(channel: "l" | "c" | "h", base: Oklch, steps = 16): string {
  const stops: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    let color: Oklch
    if (channel === "l") {
      color = { l: t, c: base.c, h: base.h }
    } else if (channel === "c") {
      color = { l: base.l, c: t * 0.4, h: base.h }
    } else {
      color = { l: base.l, c: base.c, h: t * 360 }
    }
    const fitted = isInSrgbGamut(color) ? color : fitToGamut(color)
    stops.push(oklchToHex(fitted))
  }
  return `linear-gradient(to right, ${stops.join(", ")})`
}

function round(n: number, digits: number) {
  const factor = 10 ** digits
  return Math.round(n * factor) / factor
}
