import { deriveScaleCss, SCALE_STEPS } from "../../../../utils/shade-generation"
import type { Oklch } from "@repo/domain-theme"

export type ColorPreviewStripProps = {
  colors: Oklch[]
  mode: "light" | "dark"
}

/**
 * Renders the derived 11-step scale for the first supplied color.
 *
 * Takes `Oklch` objects rather than CSS strings: the strip previously accepted
 * strings and re-parsed them, which round-tripped every color through a
 * serializer and a parser for no gain.
 */
export default function ColorPreviewStrip({
  colors,
  mode,
}: ColorPreviewStripProps) {
  const [base] = colors

  if (!base) {
    return (
      <div className="text-muted-foreground text-sm">
        No valid colors provided.
      </div>
    )
  }

  // `deriveScaleCss` returns CSS strings; `deriveScale` returns Oklch objects
  // that would stringify to "[object Object]" if used as a style value.
  const scale = deriveScaleCss(base, mode)

  return (
    <div className="flex h-6 gap-0.5 overflow-hidden rounded-lg">
      {SCALE_STEPS.map((step) => {
        const shade = scale[String(step)]
        return (
          <div
            key={step}
            className="flex-1"
            style={{ backgroundColor: shade ?? "transparent" }}
            title={`${step}: ${shade ?? "N/A"}`}
          />
        )
      })}
    </div>
  )
}
