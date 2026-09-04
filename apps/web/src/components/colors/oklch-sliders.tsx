"use client"

import { toCss } from "@repo/ui-theme"
import type { Oklch } from "@repo/domain-theme"
import { ThumbIndicator } from "../thumb-indicator"
import ColorPreviewStrip from "./color-preview-strip"

type Props = {
  color: Oklch
  onChange: (color: Oklch) => void
  mode?: "light" | "dark"
  lightnessMin?: number
  lightnessMax?: number
}

export function OklchSliders({
  color,
  onChange,
  mode = "light",
  lightnessMin = 0.2,
  lightnessMax = 0.92,
}: Props) {
  const { h, c, l } = color
  const clampedL = Math.min(lightnessMax, Math.max(lightnessMin, l))

  // Build hue gradient background from the current chroma/lightness
  const hueGradientStops = [
    0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360,
  ]
    .map((deg) => toCss({ l, c: Math.max(c, 0.12), h: deg }))
    .join(", ")

  // Build chroma gradient (gray → saturated at current hue/lightness)
  const chromaGradient = `${toCss({ l, c: 0, h })}, ${toCss({ l, c: 0.4, h })}`

  // Build lightness gradient (clamped range at current hue/chroma)
  const lightnessGradient = `${toCss({ l: lightnessMin, c: Math.min(c, 0.08), h })}, ${toCss({ l: (lightnessMin + lightnessMax) / 2, c, h })}, ${toCss({ l: lightnessMax, c: Math.min(c, 0.06), h })}`

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Hue
          </span>
          <span className="bg-muted rounded px-2 py-0.5 font-mono text-xs tabular-nums">
            {h.toFixed(0)}°
          </span>
        </div>
        <div
          className="relative h-3 overflow-hidden rounded-full"
          style={{
            background: `linear-gradient(to right, ${hueGradientStops})`,
          }}
        >
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={h}
            onChange={(e) => onChange({ ...color, h: Number(e.target.value) })}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
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
          <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Chroma
          </span>
          <span className="bg-muted rounded px-2 py-0.5 font-mono text-xs tabular-nums">
            {c.toFixed(3)}
          </span>
        </div>
        <div
          className="relative h-3 overflow-hidden rounded-full"
          style={{ background: `linear-gradient(to right, ${chromaGradient})` }}
        >
          <input
            type="range"
            min={0}
            max={0.4}
            step={0.005}
            value={c}
            onChange={(e) => onChange({ ...color, c: Number(e.target.value) })}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <ThumbIndicator position={c / 0.4} color={toCss({ l, c, h })} />
        </div>
      </div>

      {/* Lightness */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Lightness
          </span>
          <span className="bg-muted rounded px-2 py-0.5 font-mono text-xs tabular-nums">
            {(clampedL * 100).toFixed(0)}%
          </span>
        </div>
        <div
          className="relative h-3 overflow-hidden rounded-full"
          style={{
            background: `linear-gradient(to right, ${lightnessGradient})`,
          }}
        >
          <input
            type="range"
            min={lightnessMin}
            max={lightnessMax}
            step={0.005}
            value={clampedL}
            onChange={(e) => onChange({ ...color, l: Number(e.target.value) })}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <ThumbIndicator
            position={(clampedL - lightnessMin) / (lightnessMax - lightnessMin)}
            color={toCss({ l: clampedL, c, h })}
          />
        </div>
      </div>

      <ColorPreviewStrip colors={[color]} mode={mode} />
    </div>
  )
}
