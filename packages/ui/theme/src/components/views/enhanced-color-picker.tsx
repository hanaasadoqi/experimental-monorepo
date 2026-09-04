"use client"

import { Oklch } from "@repo/domain-theme"
import { cn } from "@repo/ui-components/lib/index"
import React, { useMemo, useState } from "react"
import { getHarmonies, HarmonyType } from "../../utils/shade-generation"

export type EnhancedColorPickerProps = {
  color: Oklch
  onChange: (_newColor: Oklch, _harmonyType?: HarmonyType) => void
  label?: string
  showContrast?: boolean
  contrastBackground?: Oklch
}

export function EnhancedColorPicker({
  color: _color,
  onChange,
  label = "Color",
  showContrast = true,
  contrastBackground = { l: 1, c: 0, h: 0 },
}: EnhancedColorPickerProps) {
  const [showPanel, setShowPanel] = useState(false)
  const [selectedHarmony, setSelectedHarmony] = useState<HarmonyType | null>(
    null
  )
  const panelRef = React.useRef<HTMLDivElement>(null)

  const color = _color

  const harmonies = useMemo(() => getHarmonies(color), [color])

  // Close panel on outside click
  React.useEffect(() => {
    if (!showPanel) return

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false)
      }
    }

    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showPanel])

  const OklchCss = `Oklch(${color.l}% ${color.c} ${color.h}deg)`

  const handleColorSelect = (newColor: Oklch, harmonyType: HarmonyType) => {
    setSelectedHarmony(harmonyType)
    onChange(newColor, harmonyType)
  }

  return (
    <div ref={panelRef} className="relative inline-block">
      {/* Trigger */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowPanel((prev) => !prev)
        }}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg border-2 transition-all",
          "hover:bg-accent/50 hover:border-accent",
          showPanel ? "border-primary bg-accent/30" : "border-border"
        )}
      >
        <div
          className="w-8 h-8 rounded-md border border-border shadow-sm"
          style={{ backgroundColor: OklchCss }}
        />
        <div className="text-left">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground font-mono">
            {color.h.toFixed(0)}° / {color.c.toFixed(2)} / {color.l.toFixed(0)}
          </div>
        </div>
        {selectedHarmony && (
          <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">
            {selectedHarmony}
          </span>
        )}
      </button>

      {/* Panel */}
      {showPanel && (
        <div
          className="absolute top-full left-0 z-50 mt-2 w-80 bg-popover border border-border shadow-lg rounded-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Current Color Display */}
          <div className="p-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg border-2 border-border shadow-sm"
                style={{ backgroundColor: OklchCss }}
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  H: {color.h.toFixed(0)}° C: {color.c.toFixed(2)} L:{" "}
                  {color.l.toFixed(0)}
                </p>
                {selectedHarmony && (
                  <p className="text-xs text-primary font-medium mt-0.5">
                    {selectedHarmony.charAt(0).toUpperCase() +
                      selectedHarmony.slice(1)}{" "}
                    harmony
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 p-3 max-h-80 overflow-y-auto">
            {/* Harmonies Section */}
            <div>
              <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                Color Harmonies
              </h3>
              <div className="space-y-2">
                {harmonies.map((harmony) => (
                  <div
                    key={harmony.type}
                    className={cn(
                      "p-2 rounded-lg border transition-colors",
                      selectedHarmony === harmony.type
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/30 hover:bg-muted/50"
                    )}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-xs font-medium text-foreground">
                        {harmony.name}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {harmony.colors.map((c, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleColorSelect(c, harmony.type)}
                          className={cn(
                            "w-7 h-7 rounded border transition-all shadow-sm",
                            "hover:scale-110 hover:ring-2 hover:ring-primary hover:z-10"
                          )}
                          style={{
                            backgroundColor: `Oklch(${c.l}% ${c.c} ${c.h}deg)`,
                            borderColor: "var(--border)",
                          }}
                          title={`${harmony.name}: H${c.h.toFixed(0)}° L${c.l.toFixed(0)}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contrast Diagnostics */}
            {showContrast && (
              <div className="pt-2 border-t border-border">
                <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                  Preview
                </h3>
                <div
                  className="p-3 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: OklchCss,
                    color: `Oklch(${contrastBackground.l}% ${contrastBackground.c} ${contrastBackground.h}deg)`,
                  }}
                >
                  Sample text on color
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

EnhancedColorPicker.displayName = "EnhancedColorPicker"
