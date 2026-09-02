export type DensityMode = "compact" | "default" | "reading"

export const DENSITY_MODES: DensityMode[] = ["compact", "default", "reading"]
export const DEFAULT_DENSITY: DensityMode = "default"

export type EditorVariant =
  "default" | "compact" | "reading" | "sidebar" | "inline"

export const EDITOR_VARIANT_CLASS_MAP: Record<EditorVariant, string> = {
  default: "",
  compact: "sc-editor--compact",
  reading: "sc-editor--reading",
  sidebar: "sc-editor--sidebar",
  inline: "sc-editor--inline",
}

export function getEditorVariantClassName(variant: EditorVariant): string {
  const extra = EDITOR_VARIANT_CLASS_MAP[variant] ?? ""
  return ["sc-editor", extra].filter(Boolean).join(" ")
}
