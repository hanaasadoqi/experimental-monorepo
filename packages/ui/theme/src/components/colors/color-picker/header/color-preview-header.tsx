"use client"

import { Dices, TriangleAlert } from "lucide-react"
import { Button } from "@repo/ui-components/base/button"
import { CopyButton } from "@repo/ui-components/buttons/copy-value"

export type ColorPreviewHeaderProps = {
  hex: string
  css: string
  inGamut: boolean
  onRandomize: () => void
}

/** Swatch, copyable OKLCH value, out-of-gamut warning, and randomize action for compact picker headers. */
export function ColorPreviewHeader({
  hex,
  css,
  inGamut,
  onRandomize,
}: ColorPreviewHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="border-border/70 size-8 shrink-0 rounded-sm border"
        style={{ backgroundColor: hex }}
        aria-hidden
      />

      <CopyButton value={css} label="OKLCH value" className="min-w-0 flex-1">
        <span className="block truncate font-mono text-xs tabular-nums">
          {css}
        </span>
      </CopyButton>
      {!inGamut && (
        <span
          className="text-muted-foreground flex shrink-0 items-center"
          title="Chroma reduced to render in sRGB"
        >
          <TriangleAlert className="size-3.5" aria-hidden />
          <span className="sr-only">Chroma reduced to render in sRGB</span>
        </span>
      )}
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onRandomize}
        className="size-7 shrink-0"
        aria-label="Randomize color"
      >
        <Dices className="size-3.5" aria-hidden />
      </Button>
    </div>
  )
}
