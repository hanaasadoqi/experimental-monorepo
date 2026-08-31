"use client"

import {
  type OKLCH,
  type ColorHarmony,
  getHarmonies,
} from "../shade-generation"
import { cn } from "@repo/ui-components/lib/utils"

export interface HarmonyPickerProps {
  accentColor?: OKLCH
  onAccentColorChange: (color: OKLCH) => void
  onAccentClear?: () => void
  primaryColor?: OKLCH
}

export function HarmonyPicker({
  accentColor,
  onAccentColorChange,
  onAccentClear,
  primaryColor = { h: 0, c: 0.2, l: 55 },
}: HarmonyPickerProps) {
  const harmonies = getHarmonies(primaryColor)

  const handleHarmonySelect = (harmony: ColorHarmony, colorIndex: number) => {
    const selectedColor = harmony.colors[colorIndex]
    if (selectedColor) {
      onAccentColorChange(selectedColor)
    }
  }

  const handleToggleHarmony = (harmony: ColorHarmony) => {
    const isCurrentHarmony =
      accentColor && accentColor.h === harmony.colors[0]?.h
    if (isCurrentHarmony && onAccentClear) {
      onAccentClear()
    } else {
      handleHarmonySelect(harmony, 0)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Accent Harmony
        </span>
        {accentColor && onAccentClear && (
          <button
            onClick={onAccentClear}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {harmonies.map((harmony) => {
          const isSelected = accentColor?.h === harmony.colors[0]?.h

          return (
            <div
              key={harmony.type}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer",
                isSelected
                  ? "border-primary/60 bg-primary/5"
                  : "border-border hover:border-border/80 hover:bg-muted/40"
              )}
              onClick={() => handleToggleHarmony(harmony)}
            >
              {/* Color dots */}
              <div className="flex gap-1 shrink-0">
                {harmony.colors.map((color, i) => (
                  <button
                    key={`${harmony.type}-${i}`}
                    className="w-5 h-5 rounded-full border border-white/20 shadow-sm hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: `oklch(${color.l.toFixed(2)}% ${color.c.toFixed(4)} ${color.h.toFixed(1)})`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleHarmonySelect(harmony, i)
                    }}
                    title={`Use ${harmony.name} color ${i + 1}`}
                  />
                ))}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">
                  {harmony.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {harmony.description}
                </p>
              </div>

              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
