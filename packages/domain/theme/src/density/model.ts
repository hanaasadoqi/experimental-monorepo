import { z } from "zod"

/** Spacing/sizing density applied across the app shell. */
export const densityModeSchema = z.enum(["compact", "default", "reading"])

export type DensityMode = z.infer<typeof densityModeSchema>

export const DENSITY_MODES: readonly DensityMode[] = densityModeSchema.options

export const DEFAULT_DENSITY: DensityMode = "default"

/** Editor-surface variants. Broader than density: includes placement variants. */
export const editorVariantSchema = z.enum([
  "default",
  "compact",
  "reading",
  "sidebar",
  "inline",
])

export type EditorVariant = z.infer<typeof editorVariantSchema>

export const EDITOR_VARIANT_CLASS_MAP: Record<EditorVariant, string> = {
  default: "",
  compact: "sc-editor--compact",
  reading: "sc-editor--reading",
  sidebar: "sc-editor--sidebar",
  inline: "sc-editor--inline",
}
