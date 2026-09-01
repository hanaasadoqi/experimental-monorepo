import { converter } from "culori"
import type { Oklch } from "culori"

type RGBColor = { r: number; g: number; b: number; a?: number }

const rgbToOklch = converter("oklch")

export function convertToOklch(color: string | RGBColor): { l: number; c: number; h: number } {
  const oklch = rgbToOklch(typeof color === "string" ? color : { ...color, mode: "rgb" })

  if (!oklch) {
    throw new Error("Invalid color input")
  }

  return {
    l: oklch.l,
    c: oklch.c,
    h: oklch.h ?? 0,
  }
}

export function formatOklch({ l, c, h }: { l: number; c: number; h: number }): string {
  return `oklch(${(l * 100).toFixed(2)}% ${c.toFixed(4)} ${h.toFixed(2)})`
}

export function convertOklchToRgb(oklch: { l: number; c: number; h: number }): { r: number; g: number; b: number } {
  const oklchToRgbConverter = converter("rgb")
  const rgb = oklchToRgbConverter({
    mode: "oklch",
    l: oklch.l,
    c: oklch.c,
    h: oklch.h,
  })

  if (!rgb) {
    return { r: 1, g: 1, b: 1 }
  }

  return {
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
  }
}
