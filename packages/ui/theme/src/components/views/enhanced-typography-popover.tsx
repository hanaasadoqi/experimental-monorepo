"use client"

import { cn } from "@repo/ui-components/lib/index"
import React, { useState } from "react"

export type TypographyInput = {
  fontFamily?: {
    body?: string
    heading?: string
  }
  scaleFactor?: number
  preset?: string
  stepAdjustments?: Record<string, number>
}

export type EnhancedTypographyPickerProps = {
  typography: TypographyInput
  onChange: (_typography: TypographyInput) => void
  label?: string
  showPresets?: boolean
  showPreview?: boolean
}

const FONT_FAMILIES = [
  "Inter, system-ui, sans-serif",
  "Georgia, serif",
  "Courier New, monospace",
  "Trebuchet MS, sans-serif",
  "Times New Roman, serif",
  "Verdana, sans-serif",
]

const SCALE_PRESETS = {
  compact: 0.85,
  default: 1,
  comfortable: 1.1,
  large: 1.25,
  extraLarge: 1.4,
}

const PRESET_LABELS: Record<keyof typeof SCALE_PRESETS, string> = {
  compact: "Compact (0.85x)",
  default: "Default (1x)",
  comfortable: "Comfortable (1.1x)",
  large: "Large (1.25x)",
  extraLarge: "Extra Large (1.4x)",
}

export function EnhancedTypographyPicker({
  typography,
  onChange,
  label = "Typography",
  showPresets = true,
  showPreview = true,
}: EnhancedTypographyPickerProps) {
  const [showPanel, setShowPanel] = useState(false)
  const panelRef = React.useRef<HTMLDivElement>(null)

  const bodyFont = typography.fontFamily?.body ?? "system-ui"
  const headingFont = typography.fontFamily?.heading ?? "system-ui"
  const scaleFactor = typography.scaleFactor ?? 1
  const preset = typography.preset ?? "default"

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

  return (
    <div ref={panelRef} className="relative inline-block">
      {/* Trigger Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowPanel((prev) => !prev)
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
      >
        <div className="w-6 h-6 flex items-center justify-center rounded border border-border bg-muted">
          <span className="text-xs font-bold">T</span>
        </div>
        <span className="text-sm font-medium">{label}</span>
      </button>

      {/* Panel */}
      {showPanel && (
        <div
          className="absolute top-full left-0 z-50 mt-2 w-96 bg-popover border border-border shadow-lg rounded-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4 p-4">
            {/* Font Family Controls */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Font Families
              </h3>

              {/* Body Font */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Body Font
                </label>
                <select
                  value={bodyFont}
                  onChange={(e) =>
                    onChange({
                      ...typography,
                      fontFamily: {
                        body: e.target.value,
                        heading: headingFont,
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {FONT_FAMILIES.map((font) => (
                    <option key={font} value={font}>
                      {font.split(",")[0]?.trim()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Heading Font */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Heading Font
                </label>
                <select
                  value={headingFont}
                  onChange={(e) =>
                    onChange({
                      ...typography,
                      fontFamily: {
                        body: bodyFont,
                        heading: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {FONT_FAMILIES.map((font) => (
                    <option key={font} value={font}>
                      {font.split(",")[0]?.trim()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scale Factor Control */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Scale Factor
                </h3>
                <span className="text-sm font-mono font-semibold text-foreground">
                  {scaleFactor.toFixed(2)}x
                </span>
              </div>

              {/* Slider */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onChange({
                      ...typography,
                      scaleFactor: Math.max(0.8, scaleFactor - 0.1),
                    })
                  }
                  className="shrink-0 px-2 py-1 rounded border border-border hover:bg-muted text-sm font-semibold"
                >
                  −
                </button>
                <input
                  type="range"
                  min={0.8}
                  max={1.5}
                  step="0.05"
                  value={scaleFactor}
                  onChange={(e) =>
                    onChange({
                      ...typography,
                      scaleFactor: Number.parseFloat(e.target.value),
                    })
                  }
                  className="flex-1 accent-primary"
                />
                <button
                  onClick={() =>
                    onChange({
                      ...typography,
                      scaleFactor: Math.min(1.5, scaleFactor + 0.1),
                    })
                  }
                  className="shrink-0 px-2 py-1 rounded border border-border hover:bg-muted text-sm font-semibold"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Range: 0.8x – 1.5x
              </p>
            </div>

            {/* Preset Buttons */}
            {showPresets && (
              <div className="pt-4 border-t border-border space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Presets
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PRESET_LABELS).map(
                    ([presetKey, presetLabel]) => (
                      <button
                        key={presetKey}
                        onClick={() =>
                          onChange({
                            ...typography,
                            preset: presetKey,
                            scaleFactor:
                              SCALE_PRESETS[
                                presetKey as keyof typeof SCALE_PRESETS
                              ],
                          })
                        }
                        className={cn(
                          "px-3 py-2 text-xs rounded-lg border transition-colors",
                          preset === presetKey
                            ? "border-primary bg-primary/10 font-semibold text-primary"
                            : "border-border hover:bg-muted text-foreground"
                        )}
                      >
                        {presetLabel}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Live Preview */}
            {showPreview && (
              <div className="pt-4 border-t border-border space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Preview
                </h3>

                <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground">
                    Body: {bodyFont.split(",")[0]?.trim()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Heading: {headingFont.split(",")[0]?.trim()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

EnhancedTypographyPicker.displayName = "EnhancedTypographyPicker"
