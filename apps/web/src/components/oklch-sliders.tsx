"use client"

import { toCss } from "@repo/ui-theme"
import type { Oklch } from "@repo/domain-theme"
import { ThumbIndicator } from "./thumb-indicator";
import ColorPreviewStrip from "./color-preview-strip";

type Props = {
  color: Oklch
  onChange: (color: Oklch) => void
  mode?: "light" | "dark"
}

export function OklchSliders({ color, onChange, mode = "light" }: Props) {
  const { h, c, l } = color

  // Build hue gradient background from the current chroma/lightness
  const hueGradientStops = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360]
    .map((deg) => toCss({ l, c: Math.max(c, 0.12), h: deg }))
    .join(", ")

  // Build chroma gradient (gray → saturated at current hue/lightness)
  const chromaGradient = `${toCss({ l, c: 0, h })}, ${toCss({ l, c: 0.4, h })}`

  // Build lightness gradient (black → white at current hue/chroma)
  const lightnessGradient = `${toCss({ l: 0.05, c: Math.min(c, 0.08), h })}, ${toCss({ l: 0.6, c, h })}, ${toCss({ l: 0.97, c: Math.min(c, 0.06), h })}`

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hue</span>
          <span className="text-xs font-mono tabular-nums bg-muted px-2 py-0.5 rounded">
            {h.toFixed(0)}°
          </span>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden"
          style={{ background: `linear-gradient(to right, ${hueGradientStops})` }}
        >
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={h}
            onChange={(e) => onChange({ ...color, h: Number(e.target.value) })}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            style={{ WebkitAppearance: "none" }}
          />
          <ThumbIndicator
            position={h / 360}
            color={toCss({ l, c: Math.max(c, 0.12), h })}
          />
        </div>
      </div>

      {/* Chroma */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Chroma</span>
          <span className="text-xs font-mono tabular-nums bg-muted px-2 py-0.5 rounded">
            {c.toFixed(3)}
          </span>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden"
          style={{ background: `linear-gradient(to right, ${chromaGradient})` }}
        >
          <input
            type="range"
            min={0}
            max={0.4}
            step={0.005}
            value={c}
            onChange={(e) => onChange({ ...color, c: Number(e.target.value) })}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          />
          <ThumbIndicator
            position={c / 0.4}
            color={toCss({ l, c, h })}
          />
        </div>
      </div>

      {/* Lightness */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lightness</span>
          <span className="text-xs font-mono tabular-nums bg-muted px-2 py-0.5 rounded">
            {(l * 100).toFixed(0)}%
          </span>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden"
          style={{ background: `linear-gradient(to right, ${lightnessGradient})` }}
        >
          <input
            type="range"
            min={0.03}
            max={0.99}
            step={0.005}
            value={l}
            onChange={(e) => onChange({ ...color, l: Number(e.target.value) })}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          />
          <ThumbIndicator
            position={(l - 0.03) / 0.96}
            color={toCss({ l, c, h })}
          />
        </div>
      </div>

      <ColorPreviewStrip colors={[color]} mode={mode} />
    </div>
  )
}
