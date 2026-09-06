import {
  parseColorInput,
  toOklch,
  toRgb,
  type RgbColor as Rgb,
} from "@repo/domain-theme/colors"

/**
 * RGB color type matching Culori's RGB structure.
 * r, g, b are normalized to 0-1 range in Culori,
 * but stored as 0-255 in our Rgba type.
 */

const oklch = toOklch
const rgb = toRgb
const clamp255 = (value: number) => {
  return Math.min(255, Math.max(0, Math.round(value)))
}

function oklchToRgbObj(colorStr: string): Rgb {
  const parsed = parseColorInput(colorStr)

  if (!parsed) {
    return { r: 0, g: 0, b: 0, a: 1 }
  }

  const rgbObj = rgb({ l: parsed.l, c: parsed.c, h: parsed.h })

  if (!rgbObj) {
    return { r: 0, g: 0, b: 0, a: 1 }
  }

  return {
    r: clamp255((rgbObj.r ?? 0) * 255),
    g: clamp255((rgbObj.g ?? 0) * 255),
    b: clamp255((rgbObj.b ?? 0) * 255),
    a: 1,
  }
}
function rgbaObjToOklchStr(rgbaObj: Rgb): string {
  const culoriRgb: Rgb = {
    b: rgbaObj.b / 255,
    r: rgbaObj.r / 255,
    g: rgbaObj.g / 255,
  }

  const oklchObj = oklch({
    ...culoriRgb,
  })

  if (!oklchObj) {
    return "oklch(0 0 0)"
  }

  const l = (oklchObj.l ?? 0).toFixed(3)
  const c = (oklchObj.c ?? 0).toFixed(3)
  const h = Number.isFinite(oklchObj.h) ? oklchObj.h!.toFixed(1) : "0"

  return `oklch(${l} ${c} ${h})`
}

export { oklchToRgbObj, rgbaObjToOklchStr }
export { oklch, rgb, type Rgb }
