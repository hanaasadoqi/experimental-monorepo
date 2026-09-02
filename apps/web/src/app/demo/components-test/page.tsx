"use client"

import { useState } from "react"
import {
  OklchSliders,
  HuePresetGrid,
  ContrastIndicator,
  HarmonyPicker,
  ColorScalePreview,
} from "@repo/ui-theme/components"
import type { OklchColor } from "@repo/domain-theme/colors"

export default function ComponentsTestPage() {
  const [primaryColor, setPrimaryColor] = useState<OklchColor>({
    l: 55,
    c: 0.15,
    h: 250,
  })

  const [accentColor, setAccentColor] = useState<OklchColor | undefined>({
    l: 55,
    c: 0.15,
    h: 30,
  })

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Display Components</h1>
          <p className="text-muted-foreground">Rendered separately for composition</p>
        </div>

        {/* OklchSliders */}
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">OklchSliders</h2>
          <OklchSliders color={primaryColor} onChange={setPrimaryColor} />
        </section>

        {/* HuePresetGrid */}
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">HuePresetGrid</h2>
          <HuePresetGrid color={primaryColor} onColorSelect={setPrimaryColor} />
        </section>

        {/* ContrastIndicator */}
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">ContrastIndicator</h2>
          <ContrastIndicator color={primaryColor} />
        </section>

        {/* HarmonyPicker */}
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">HarmonyPicker</h2>
          <HarmonyPicker
            primaryColor={primaryColor}
            accentColor={accentColor}
            onAccentColorChange={setAccentColor}
            onAccentClear={() => setAccentColor(undefined)}
          />
        </section>

        {/* ColorScalePreview */}
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">ColorScalePreview</h2>
          <ColorScalePreview
            primaryColor={primaryColor}
            accentColor={accentColor}
          />
        </section>

        {/* Current state */}
        <section className="bg-muted/50 border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Current State</h3>
          <div className="grid grid-cols-2 gap-4 font-mono text-sm">
            <div>
              <p className="text-muted-foreground">Primary:</p>
              <p className="text-foreground">L: {primaryColor.l.toFixed(1)}</p>
              <p className="text-foreground">C: {primaryColor.c.toFixed(3)}</p>
              <p className="text-foreground">H: {primaryColor.h.toFixed(0)}°</p>
            </div>
            <div>
              <p className="text-muted-foreground">Accent:</p>
              {accentColor ? (
                <>
                  <p className="text-foreground">L: {accentColor.l.toFixed(1)}</p>
                  <p className="text-foreground">C: {accentColor.c.toFixed(3)}</p>
                  <p className="text-foreground">H: {accentColor.h.toFixed(0)}°</p>
                </>
              ) : (
                <p className="text-muted-foreground">None</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
