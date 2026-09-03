/**
 * Color: the OKLCH model plus the algorithms over it.
 *
 *   model.ts          types + Zod schemas (both OKLCH representations)
 *   constants.ts      bounds, WCAG thresholds, shade-ramp curve
 *   parse.ts          string/object -> color, and the validation mediator
 *   convert.ts        color -> CSS, hex, RGB bytes
 *   gamut.ts          channel clamping and sRGB gamut fitting
 *   transforms.ts     OKLCH -> LMS -> linear RGB
 *   luminance.ts      relative luminance (WCAG)
 *   accessibility.ts  contrast ratios and WCAG levels
 *   shades.ts         shade ramp generation
 *   gradient.ts       CSS gradient preview strings
 *   harmony.ts        hue-rotation harmony sets
 */
export * from "./model"
export * from "./constants"
export * from "./parse"
export * from "./convert"
export * from "./gamut"
export * from "./transforms"
export * from "./luminance"
export * from "./accessibility"
export * from "./shades"
export * from "./gradient"
export * from "./harmony"
/**
 * Renamed on export: culori's own `Oklch`/`Rgb` types would otherwise collide
 * with (and silently shadow) this package's `Oklch` from `./model` above,
 * since an explicit named re-export wins over a wildcard `export *`. Only
 * `converter`-based conversion code should need these raw culori shapes.
 */
export { type Oklch as CuloriOklch, type Rgb as CuloriRgb, converter } from "culori"
