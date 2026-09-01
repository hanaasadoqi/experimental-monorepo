"use client"

import type { OklchColor } from "../../../domain/core/colors/model"
import { HUE_PRESETS } from "../../../domain/core/colors/shade-generation"
import { cn } from "@repo/ui-components/lib/utils"

export interface HuePresetGridProps {
  color: OklchColor
  onColorSelect: (color: OklchColor) => void
}

export function HuePresetGrid({ color, onColorSelect }: HuePresetGridProps) {
  const categories = ["Warm", "Cool", "Purple", "Neutral"]

  const isPresetActive = (preset: (typeof HUE_PRESETS)[0]) => {
    return (
      Math.abs(color.h - preset.h) < 3 && Math.abs(color.c - preset.c) < 0.02
    )
  }

  const getPresetCss = (preset: (typeof HUE_PRESETS)[0]) => {
    return `oklch(${preset.l.toFixed(2)}% ${preset.c.toFixed(4)} ${preset.h.toFixed(1)})`
  }

  return (
    <div className="space-y-3">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Quick Presets
      </span>
      {categories.map((category: string) => {
        const presets = HUE_PRESETS.filter((p: (typeof HUE_PRESETS)[0]) => p.category === category)
        if (!presets.length) return null

        return (
          <div key={category}>
            <p className="text-[10px] text-muted-foreground mb-1.5">
              {category}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset: (typeof HUE_PRESETS)[0]) => {
                const isActive = isPresetActive(preset)
                const bgColor = getPresetCss(preset)

                return (
                  <button
                    key={preset.name}
                    onClick={() =>
                      onColorSelect({ h: preset.h, c: preset.c, l: preset.l })
                    }
                    title={`${preset.name}: H${preset.h}° C${preset.c}`}
                    className={cn(
                      "w-7 h-7 rounded-md border-2 transition-all",
                      isActive
                        ? "border-foreground scale-110 shadow-md"
                        : "border-transparent hover:scale-105 hover:border-foreground/40"
                    )}
                    style={{ backgroundColor: bgColor }}
                    aria-label={preset.name}
                    aria-pressed={isActive}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
