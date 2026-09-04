import { type RGBColor as Rgb } from "react-color"
import type {} from "react-color"
import { converter, parseColorInput } from "@repo/domain-theme/colors"
import type { CuloriOklch, CuloriRgb } from "@repo/domain-theme/colors"

const oklch = converter("oklch") as (
  color: Parameters<ReturnType<typeof converter>>[0]
) => CuloriOklch | undefined
const rgb = converter("rgb") as (
  color: Parameters<ReturnType<typeof converter>>[0]
) => CuloriRgb | undefined
type Rgba = Omit<Rgb, "mode"> & { a?: number }
const clamp255 = (value: number) => {
  return Math.min(255, Math.max(0, Math.round(value)))
}

function oklchToRgbaObj(colorStr: string): Rgba {
  const parsed = parseColorInput(colorStr)

  if (!parsed) {
    return { r: 0, g: 0, b: 0, a: 1 }
  }

  const rgbObj = rgb({ mode: "oklch", l: parsed.l, c: parsed.c, h: parsed.h })

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
function rgbaObjToOklchStr(rgbaObj: Rgba): string {
  const culoriRgb: Rgb = {
    b: rgbaObj.b / 255,
    r: rgbaObj.r / 255,
    g: rgbaObj.g / 255,
  }

  const oklchObj = oklch({
    ...culoriRgb,

    mode: "rgb",
  })

  if (!oklchObj) {
    return "oklch(0 0 0)"
  }

  const l = (oklchObj.l ?? 0).toFixed(3)
  const c = (oklchObj.c ?? 0).toFixed(3)
  const h = Number.isFinite(oklchObj.h) ? oklchObj.h!.toFixed(1) : "0"

  return `oklch(${l} ${c} ${h})`
}

export { oklchToRgbaObj, rgbaObjToOklchStr }
export { oklch, rgb, type CuloriOklch, type Rgb, type Rgba }
