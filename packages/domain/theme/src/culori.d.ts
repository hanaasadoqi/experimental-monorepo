declare module "culori" {
  export interface Oklch {
    mode?: string
    l: number
    c: number
    h: number
    alpha?: number
  }

  export interface Rgb {
    mode?: string
    r: number
    g: number
    b: number
    alpha?: number
  }

  export function converter(target: "oklch" | "rgb"): (color: any) => any
}
