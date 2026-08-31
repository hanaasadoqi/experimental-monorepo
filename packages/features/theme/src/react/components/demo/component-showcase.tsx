"use client"

import { useState } from "react"
import { ColorEditor } from "../display/color-editor"
import { ColorScaleViewer } from "../display/color-scale-preview"
import { TypographyEditor } from "../display/typography-editor"
import { TypographyPanel } from "../display/typography-panel"
import { TypographyShowcase } from "../display/typography-type-scale"
import { DesignPanel } from "../display/design-panel"
import { OklchSliders } from "../display/oklch-sliders"

export function ComponentShowcase() {
  // Color Editor State
  const [primaryColor, setPrimaryColor] = useState({ h: 250, c: 0.15, l: 52 })
  const [accentColor, setAccentColor] = useState<
    { h: number; c: number; l: number } | undefined
  >({
    h: 160,
    c: 0.18,
    l: 55,
  })
  const [colorMode, setColorMode] = useState<"light" | "dark">("light")

  // Typography State
  const [scaleFactor, setScaleFactor] = useState(1)
  const [previewTab, setPreviewTab] = useState<
    "scale" | "components" | "tokens"
  >("scale")

  // Design Panel State
  const designSpacing = ["0.5", "1", "1.5", "2", "2.5", "3", "4", "6", "8"]
  const designRadii: Array<[string, string]> = [
    ["none", "rounded-none"],
    ["sm", "rounded-sm"],
    ["md", "rounded-md"],
    ["lg", "rounded-lg"],
    ["xl", "rounded-xl"],
    ["2xl", "rounded-2xl"],
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12 space-y-16">
        <header className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">
            Theme Components Showcase
          </h1>
          <p className="text-xl text-muted-foreground">
            Interactive demonstrations of all color editor and typography
            components
          </p>
        </header>

        {/* Color Editor Section */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold">Color Editor</h2>
            <p className="text-sm text-muted-foreground">
              Standalone color editing interface with presets, harmony picker,
              and contrast analysis
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <ColorEditor
              primaryColor={primaryColor}
              onPrimaryColorChange={setPrimaryColor}
              accentColor={accentColor}
              onAccentColorChange={setAccentColor}
              onAccentClear={() => setAccentColor(undefined)}
              mode={colorMode}
            />
          </div>
        </section>

        {/* Color Mode Toggle */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Preview Mode</h3>
            <p className="text-sm text-muted-foreground">
              Toggle light/dark mode for color scales
            </p>
          </div>
          <div className="flex gap-2">
            {(["light", "dark"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setColorMode(mode)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  colorMode === mode
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
              </button>
            ))}
          </div>
        </section>

        {/* Color Scale Viewer */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold">Color Scale Viewer</h2>
            <p className="text-sm text-muted-foreground">
              Preview generated color scales with semantic and token exports
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <ColorScaleViewer
              primaryColor={primaryColor}
              accentColor={accentColor}
              mode={colorMode}
              previewTab={previewTab}
              onPreviewTabChange={setPreviewTab}
            />
          </div>
        </section>

        {/* OkLCH Sliders */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold">OkLCH Sliders</h2>
            <p className="text-sm text-muted-foreground">
              Interactive sliders for fine-tuning color properties
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <OklchSliders
              color={primaryColor}
              onChange={setPrimaryColor}
              mode={colorMode}
            />
          </div>
        </section>

        {/* Typography Editor */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold">Typography Editor</h2>
            <p className="text-sm text-muted-foreground">
              Font scale controls and type system preview
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <TypographyEditor
              scaleFactor={scaleFactor}
              onScaleFactorChange={setScaleFactor}
            />
          </div>
        </section>

        {/* Typography Panel */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold">Typography Panel</h2>
            <p className="text-sm text-muted-foreground">
              Comprehensive type system documentation
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <TypographyPanel />
          </div>
        </section>

        {/* Typography Type Scale */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold">Typography Type Scale</h2>
            <p className="text-sm text-muted-foreground">
              Visual display of font sizes and weights
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <TypographyShowcase />
          </div>
        </section>

        {/* Design Panel */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold">Design Panel</h2>
            <p className="text-sm text-muted-foreground">
              Spacing, radius, and border treatment system
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <DesignPanel spacing={designSpacing} radii={designRadii} />
          </div>
        </section>

        {/* Component State Display */}
        <section className="space-y-4 border-t border-border pt-8">
          <h3 className="text-xl font-semibold">Current State</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <pre className="rounded-lg bg-muted p-4 text-xs overflow-auto">
              {JSON.stringify(
                {
                  primaryColor,
                  accentColor,
                  colorMode,
                  typographyScale: scaleFactor,
                },
                null,
                2
              )}
            </pre>
          </div>
        </section>
      </div>
    </div>
  )
}
