// packages/typography/src/fontScale.ts

export type FontScaleStep = -2 | -1 | 0 | 1 | 2

export const FONT_SCALE_STEPS: FontScaleStep[] = [-2, -1, 0, 1, 2]

export const DEFAULT_FONT_SCALE: FontScaleStep = 0

export function clampFontScale(step: number): FontScaleStep {
  if (step <= -2) return -2
  if (step >= 2) return 2
  return step as FontScaleStep
}

export function getNextFontScale(
  current: FontScaleStep,
  delta: -1 | 1
): FontScaleStep {
  const index = FONT_SCALE_STEPS.indexOf(current)
  const next = FONT_SCALE_STEPS[index + delta]
  return next ?? current
}

/**
 * Apply the font scale to document.body using the data attribute.
 * You can call this from a hook or settings panel.
 */
export function applyFontScaleToDocument(step: FontScaleStep): void {
  if (typeof document === "undefined") return
  const value = String(step)
  document.body.setAttribute("data-font-scale", value)
}

/**
 * Read the current font scale from document.body.
 * Falls back to DEFAULT_FONT_SCALE when not present.
 */
export function getFontScaleFromDocument(): FontScaleStep {
  if (typeof document === "undefined") return DEFAULT_FONT_SCALE
  const raw = document.body.getAttribute("data-font-scale")
  if (raw == null) return DEFAULT_FONT_SCALE
  const num = Number(raw)
  if (!Number.isFinite(num)) return DEFAULT_FONT_SCALE
  return clampFontScale(num)
}
