import { EDITOR_VARIANT_CLASS_MAP, type EditorVariant } from "./model"

/** Build the class list for an editor surface variant. */
export function getEditorVariantClassName(variant: EditorVariant): string {
  const extra = EDITOR_VARIANT_CLASS_MAP[variant] ?? ""
  return ["sc-editor", extra].filter(Boolean).join(" ")
}
