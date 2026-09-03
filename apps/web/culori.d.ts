/* eslint-disable @typescript-eslint/no-explicit-any */
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
  export function clampChroma(color: any, mode?: string): any
  export function displayable(color: any): boolean
  export function formatHex(color: any): string | null
  export function parseOklch(str: string): Oklch | null
}
