"use client"

import type { OklchColor } from "@repo/domain-theme"
import { toCss, deriveScale, SCALE_STEPS } from "../../utils/shade-generation"

export interface OklchSlidersProps {
  color: OklchColor
  onChange: (color: OklchColor) => void
  mode?: "light" | "dark"
}

export function OklchSliders({
  color,
  onChange,
  mode = "light",
}: OklchSlidersProps) {
  const { h, c, l } = color
  const scale = deriveScale(color, mode)

  const hueGradientStops = [
    0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360,
  ]
    .map((deg) => toCss({ l, c: Math.max(c, 0.12), h: deg }))
    .join(", ")

  const chromaGradient = `${toCss({ l, c: 0, h })}, ${toCss({ l, c: 0.4, h })}`

  const lightnessGradient = `${toCss({ l: 0.05, c: Math.min(c, 0.08), h })}, ${toCss({ l: 0.6, c, h })}, ${toCss({ l: 0.97, c: Math.min(c, 0.06), h })}`

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Hue
          </span>
          <span className="text-xs font-mono tabular-nums bg-muted px-2 py-0.5 rounded">
            {h.toFixed(0)}°
          </span>
        </div>
        <div
          className="relative h-3 rounded-full overflow-hidden"
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
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            style={{ WebkitAppearance: "none" }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
            style={{
              left: `calc(${(h / 360) * 100}% - 8px)`,
              backgroundColor: toCss({ l, c: Math.max(c, 0.12), h }),
              boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Chroma
          </span>
          <span className="text-xs font-mono tabular-nums bg-muted px-2 py-0.5 rounded">
            {c.toFixed(3)}
          </span>
        </div>
        <div
          className="relative h-3 rounded-full overflow-hidden"
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
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
            style={{
              left: `calc(${(c / 0.4) * 100}% - 8px)`,
              backgroundColor: toCss({ l, c, h }),
              boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Lightness
          </span>
          <span className="text-xs font-mono tabular-nums bg-muted px-2 py-0.5 rounded">
            {(l * 100).toFixed(0)}%
          </span>
        </div>
        <div
          className="relative h-3 rounded-full overflow-hidden"
          style={{
            background: `linear-gradient(to right, ${lightnessGradient})`,
          }}
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
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
            style={{
              left: `calc(${((l - 0.03) / 0.96) * 100}% - 8px)`,
              backgroundColor: toCss({ l, c, h }),
              boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}
          />
        </div>
      </div>

      <div className="flex gap-0.5 rounded-lg overflow-hidden h-6">
        {SCALE_STEPS.map((step) => {
          const shade = scale[step as keyof typeof scale]
          return (
            <div
              key={step}
              className="flex-1"
              style={{ backgroundColor: toCss(shade) }}
              title={`${step}: ${toCss(shade)}`}
            />
          )
        })}
      </div>
    </div>
  )
}
