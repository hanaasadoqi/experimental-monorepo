"use client"

import { cn } from "@repo/ui-components/lib/utils"

const SCALE_FACTOR_PRESETS = [
  { label: "XS", value: 0.8 },
  { label: "SM", value: 0.9 },
  { label: "MD", value: 1.0 },
  { label: "LG", value: 1.1 },
  { label: "XL", value: 1.25 },
]

export interface TypographyEditorProps {
  bodyFont?: string
  headingFont?: string
  scaleFactor: number
  onScaleFactorChange: (factor: number) => void
}

export function TypographyEditor({
  bodyFont = "system-ui, sans-serif",
  headingFont = "system-ui, sans-serif",
  scaleFactor,
  onScaleFactorChange,
}: TypographyEditorProps) {
  const typeSamples = [
    { tag: "h1", size: 2.25, weight: 700, label: "H1 — Display" },
    { tag: "h2", size: 1.875, weight: 600, label: "H2 — Title" },
    { tag: "h3", size: 1.5, weight: 600, label: "H3 — Heading" },
    { tag: "p", size: 1.0, weight: 400, label: "Body" },
    { tag: "small", size: 0.875, weight: 400, label: "Caption" },
  ]

  return (
    <div className="space-y-6">
      {/* Scale Factor */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Type Scale</h3>
        <div className="flex gap-1.5">
          {SCALE_FACTOR_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => onScaleFactorChange(p.value)}
              className={cn(
                "flex-1 py-2 text-xs font-medium rounded-lg border transition-all",
                Math.abs(scaleFactor - p.value) < 0.005
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted/40 text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0.75}
            max={1.5}
            step={0.01}
            value={scaleFactor}
            onChange={(e) => onScaleFactorChange(Number(e.target.value))}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-foreground"
          />
          <span className="text-xs font-mono text-muted-foreground w-10 text-right tabular-nums">
            {scaleFactor.toFixed(2)}x
          </span>
        </div>
      </section>

      <div className="border-t border-border" />

      {/* Typography Preview */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Preview</h3>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-border" />
              <div className="w-2.5 h-2.5 rounded-full bg-border" />
              <div className="w-2.5 h-2.5 rounded-full bg-border" />
            </div>
            <span className="text-xs text-muted-foreground font-mono ml-1">
              typography.preview
            </span>
          </div>
          <div className="p-4 space-y-3">
            {typeSamples.map((s) => (
              <div key={s.tag} className="flex items-baseline gap-3">
                <span className="text-[10px] font-mono text-muted-foreground w-16 shrink-0 tabular-nums">
                  {(s.size * scaleFactor).toFixed(2)}rem
                </span>
                <span
                  style={{
                    fontFamily:
                      s.tag === "p" || s.tag === "small"
                        ? bodyFont
                        : headingFont,
                    fontSize: `${s.size * scaleFactor}rem`,
                    fontWeight: s.weight,
                    lineHeight:
                      s.tag === "h1" ? 1.1 : s.tag === "p" ? 1.6 : 1.25,
                  }}
                  className="leading-tight text-foreground"
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <div className="px-4 pb-4">
            <p
              style={{
                fontFamily: bodyFont,
                fontSize: `${scaleFactor}rem`,
                lineHeight: 1.65,
              }}
              className="text-muted-foreground"
            >
              The quick brown fox jumps over the lazy dog. Pack my box with five
              dozen liquor jugs.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
