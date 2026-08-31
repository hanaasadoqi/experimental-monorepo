"use client"

import { type OKLCH, getContrastRatio, getWcagLevel } from "../../../domain/core/colors/shade-generation"
import { cn } from "@repo/ui-components/lib/utils"

export interface ContrastIndicatorProps {
  color: OKLCH
}

export function ContrastIndicator({ color }: ContrastIndicatorProps) {
  const white: OKLCH = { l: 97, c: 0, h: 0 }
  const black: OKLCH = { l: 10, c: 0, h: 0 }

  const whiteContrast = getContrastRatio(white, color)
  const blackContrast = getContrastRatio(black, color)
  const bestFg = whiteContrast >= blackContrast ? white : black
  const bestRatio = Math.max(whiteContrast, blackContrast)
  const level = getWcagLevel(bestRatio)

  const levelColors: Record<string, string> = {
    AAA: "text-emerald-600 dark:text-emerald-400",
    AA: "text-blue-600 dark:text-blue-400",
    Fail: "text-red-500",
  }

  const colorCss = `oklch(${color.l.toFixed(2)}% ${color.c.toFixed(4)} ${color.h.toFixed(1)})`
  const fgCss = `oklch(${bestFg.l.toFixed(2)}% ${bestFg.c.toFixed(4)} ${bestFg.h.toFixed(1)})`

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
      {/* Swatch */}
      <div
        className="w-10 h-10 rounded-lg border border-border shadow-sm flex items-center justify-center text-xs font-bold shrink-0"
        style={{ backgroundColor: colorCss, color: fgCss }}
      >
        Aa
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono text-muted-foreground truncate">
          {colorCss}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn("text-xs font-semibold", levelColors[level])}>
            {level}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {bestRatio.toFixed(2)}:1
          </span>
        </div>
      </div>
    </div>
  )
}
