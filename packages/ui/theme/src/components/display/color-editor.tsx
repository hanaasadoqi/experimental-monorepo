"use client"

import { HuePresetGrid } from "./hue-preset-grid"
import { ContrastIndicator } from "./contrast-indicator"
import { OklchSliders } from "./oklch-sliders"
import { OklchColor } from "@repo/domain-theme/colors";

export interface ColorObject {
  key: string
  label: string
  color: OklchColor | undefined
  onChange: (color: OklchColor) => void
  optional?: boolean
}

export interface ColorEditorProps {
  colors: ColorObject[]
}

function ColorSwatch({ color }: { color: OklchColor | undefined }) {
  if (!color) {
    return (
      <div className="w-4 h-4 rounded-full border-2 border-dashed border-border" />
    )
  }
  return (
    <div
      className="w-4 h-4 rounded-full border border-border shadow-sm"
      style={{
        backgroundColor: `oklch(${color.l.toFixed(2)}% ${color.c.toFixed(4)} ${color.h.toFixed(1)})`,
      }}
    />
  )
}

function ColorSection({ item }: { item: ColorObject }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <ColorSwatch color={item.color} />
        <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
        {item.optional && !item.color && (
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            Optional
          </span>
        )}
      </div>

      {item.color && (
        <>
          <HuePresetGrid color={item.color} onColorSelect={item.onChange} />
          <OklchSliders color={item.color} onChange={item.onChange} />
          <ContrastIndicator color={item.color} />
        </>
      )}
    </section>
  )
}

export function ColorEditor({ colors }: ColorEditorProps) {
  return (
    <div className="space-y-6">
      {colors.map((item, index) => (
        <div key={item.key}>
          <ColorSection item={item} />
          {index < colors.length - 1 && (
            <div className="border-t border-border mt-6" />
          )}
        </div>
      ))}
    </div>
  )
}
