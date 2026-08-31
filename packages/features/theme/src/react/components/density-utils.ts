// packages/typography/src/density.ts

export type DensityMode = "compact" | "default" | "reading"

export const DENSITY_MODES: DensityMode[] = ["compact", "default", "reading"]
export const DEFAULT_DENSITY: DensityMode = "default"

export function applyDensityToDocument(mode: DensityMode): void {
  if (typeof document === "undefined") return
  if (mode === DEFAULT_DENSITY) {
    document.body.setAttribute("data-density", "default")
  } else {
    document.body.setAttribute("data-density", mode)
  }
}

export function getDensityFromDocument(): DensityMode {
  if (typeof document === "undefined") return DEFAULT_DENSITY
  const mode = document.body.getAttribute("data-density") as DensityMode | null
  if (!mode || !DENSITY_MODES.includes(mode)) return DEFAULT_DENSITY
  return mode
}

export type EditorVariant =
  "default" | "compact" | "reading" | "sidebar" | "inline"

export const EDITOR_VARIANT_CLASS_MAP: Record<EditorVariant, string> = {
  default: "",
  compact: "sc-editor--compact",
  reading: "sc-editor--reading",
  sidebar: "sc-editor--sidebar",
  inline: "sc-editor--inline",
}

/**
 * Get a className string for an editor container.
 */
export function getEditorVariantClassName(variant: EditorVariant): string {
  const extra = EDITOR_VARIANT_CLASS_MAP[variant] ?? ""
  return ["sc-editor", extra].filter(Boolean).join(" ")
}
