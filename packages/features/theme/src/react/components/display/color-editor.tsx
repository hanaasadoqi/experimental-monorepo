"use client"
import { HuePresetGrid } from "./hue-preset-grid"
import { HarmonyPicker } from "./harmony-picker"
import { ContrastIndicator } from "./contrast-indicator"
import { Slider } from "@repo/ui-components/base/slider"
import type { OklchColor } from "../../../model/color"

export interface ColorEditorProps {
  primaryColor: OklchColor
  onPrimaryColorChange: (color: OklchColor) => void
  accentColor?: OklchColor
  onAccentColorChange?: (color: OklchColor) => void
  onAccentClear?: () => void
  mode?: "light" | "dark"
}

export function ColorEditor({
  primaryColor,
  onPrimaryColorChange,
  accentColor,
  onAccentColorChange,
  onAccentClear,
  mode = "light",
}: ColorEditorProps) {
  return (
    <div className="space-y-6">
      {/* Primary Color Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border border-border shadow-sm"
            style={{
              backgroundColor: `oklchColor(${primaryColor.l.toFixed(2)}% ${primaryColor.c.toFixed(4)} ${primaryColor.h.toFixed(1)})`,
            }}
          />
          <h3 className="text-sm font-semibold text-foreground">
            Primary Color
          </h3>
        </div>
        <HuePresetGrid
          color={primaryColor}
          onColorSelect={onPrimaryColorChange}
        />
        <Slider
          value={primaryColor}
          onChange={onPrimaryColorChange}
        />
        <ContrastIndicator color={primaryColor} />
      </section>

      <div className="border-t border-border" />

      {/* Accent Color Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          {accentColor ? (
            <div
              className="w-4 h-4 rounded-full border border-border shadow-sm"
              style={{
                backgroundColor: `oklchColor(${accentColor.l.toFixed(2)}% ${accentColor.c.toFixed(4)} ${accentColor.h.toFixed(1)})`,
              }}
            />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-dashed border-border" />
          )}
          <h3 className="text-sm font-semibold text-foreground">
            Accent Color
          </h3>
          {!accentColor && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              Optional
            </span>
          )}
        </div>

        {onAccentColorChange && (
          <HarmonyPicker
            primaryColor={primaryColor}
            accentColor={accentColor}
            onAccentColorChange={onAccentColorChange}
            onAccentClear={onAccentClear}
          />
        )}

        {accentColor && <ContrastIndicator color={accentColor} />}
      </section>
    </div>
  )
}
