import { converter } from 'culori'
import type { Oklch } from 'culori'

type RGBColor = { r: number; g: number; b: number; a?: number }

const rgbToOklch = converter('oklch')

export function convertToOKLCH(color: string | RGBColor): Oklch {
  const oklch = rgbToOklch(typeof color === 'string' ? color : { ...color, mode: 'rgb' })

  if (!oklch) {
    throw new Error('Invalid color input')
  }

  return {
    l: oklch.l * 100,
    c: oklch.c,
    h: oklch.h ?? 0,
    mode: 'oklch',
  }
}

export function oklchToCss({ l, c, h }: Oklch): string {
  return `oklch(${l}% ${c} ${h})`
}

export function oklchToRgb(oklch: Oklch): { r: number; g: number; b: number } {
  const oklchToRgbConverter = converter('rgb')
  const rgb = oklchToRgbConverter({
    mode: 'oklch',
    l: oklch.l / 100,
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
