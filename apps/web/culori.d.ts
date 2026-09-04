/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "culori" {
  export interface Oklch {
    mode?: string
    l: number
    c: number
    h: number
    // culori's real alpha channel is named `alpha`, not `a` — this was `a?`
    // and disagreed with @repo/domain-theme/color's convert.ts (which
    // correctly targets culori's real shape), producing
    // "Property 'alpha' does not exist" once that fix landed. See
    // .archives/apps-web/2026-09-04-culori-ambient-override/ARCHIVE.md.
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
