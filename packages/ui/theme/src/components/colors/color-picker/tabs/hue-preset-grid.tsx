"use client"

import type { Oklch } from "@repo/domain-theme"
import { cn } from "@repo/ui-components/lib/index"
import {
  HUE_PRESETS,
  autoForeground,
  toCss,
} from "../../../../utils/shade-generation"

export type HuePresetGridProps = {
  color: Oklch
  onColorSelect: (color: Oklch) => void
}

export function HuePresetGrid({
  color: primary,
  onColorSelect,
}: HuePresetGridProps) {
  const categories = ["Warm", "Cool", "Purple", "Neutral"]

  return (
    <div className="space-y-3">
      <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
        Quick Presets
      </span>
      {categories.map((cat) => {
        const presets = HUE_PRESETS.filter((p) => p.category === cat)
        if (!presets.length) return null
        return (
          <div key={cat}>
            <p className="text-muted-foreground mb-1.5 text-[10px]">{cat}</p>
            <div className="flex flex-wrap gap-1.5">
              {presets.map(
                (preset: Oklch & { category: string; name: string }) => {
                  const isActive =
                    Math.abs(primary.h - preset.h) < 3 &&
                    Math.abs(primary.c - preset.c) < 0.02
                  const bg = toCss({ h: preset.h, c: preset.c, l: preset.l })
                  const fg = toCss(
                    autoForeground({ h: preset.h, c: preset.c, l: preset.l })
                  )
                  return (
                    <button
                      key={preset.name}
                      onClick={() => onColorSelect(preset)}
                      title={`${preset.name}: H${preset.h}° C${preset.c}`}
                      className={cn(
                        "h-7 w-7 rounded-md border-2 transition-all",
                        isActive
                          ? "border-foreground scale-110 shadow-md"
                          : "hover:border-foreground/40 border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: bg, color: fg }}
                      aria-label={preset.name}
                      aria-pressed={isActive}
                    />
                  )
                }
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
