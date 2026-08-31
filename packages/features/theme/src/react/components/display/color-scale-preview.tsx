"use client"

import {
  type OKLCH,
  type ColorScale,
  SCALE_STEPS,
  toCss,
  autoForeground,
  deriveScale,
} from "../../../domain/core/colors/shade-generation"
import { cn } from "@repo/ui-components/lib/utils"
import { useState, useMemo } from "react"

type SwatchProps = {
  step: number
  color: OKLCH
  isBase?: boolean
}

function Swatch({ step, color, isBase }: SwatchProps) {
  const _fg = autoForeground(color)
  const title = `Step ${step} — L${color.l.toFixed(0)} C${color.c.toFixed(2)} H${color.h.toFixed(0)}°`

  return (
    <div
      className={cn(
        "relative rounded-lg cursor-default transition-transform duration-150 hover:scale-105",
        isBase
          ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
          : ""
      )}
      title={title}
      style={{ backgroundColor: toCss(color), aspectRatio: "1" }}
    />
  )
}

type ScaleRowProps = {
  label: string
  scale: ColorScale
  baseStep?: number
  accent?: boolean
}

function ScaleRow({
  label,
  scale,
  baseStep = 500,
  accent = false,
}: ScaleRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full border border-border"
          style={{
            backgroundColor: toCss(scale[baseStep as keyof ColorScale]),
          }}
        />
        <span className="text-xs font-semibold text-foreground">{label}</span>
        {accent && (
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            Accent
          </span>
        )}
      </div>
      <div className="grid grid-cols-11 gap-1">
        {SCALE_STEPS.map((step) => (
          <Swatch
            key={step}
            step={step}
            color={scale[step]}
            isBase={step === baseStep}
          />
        ))}
      </div>
      {/* Step labels row */}
      <div className="grid grid-cols-11 gap-1">
        {SCALE_STEPS.map((step) => (
          <div
            key={step}
            className="text-center text-[9px] text-muted-foreground font-mono"
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Semantic Color Rows ──────────────────────────────────────────────────────

function SemanticRow({
  label,
  hue,
  chroma,
  mode,
}: {
  label: string
  hue: number
  chroma: number
  mode: "light" | "dark"
}) {
  const scale = deriveScale({ h: hue, c: chroma, l: 55 }, mode)
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-20 shrink-0">
        {label}
      </span>
      <div className="flex flex-1 rounded-lg overflow-hidden h-7">
        {SCALE_STEPS.map((step) => (
          <div
            key={step}
            className="flex-1"
            style={{ backgroundColor: toCss(scale[step]) }}
            title={`${label} ${step}`}
          />
        ))}
      </div>
    </div>
  )
}

export interface ColorScalePreviewProps {
  primaryColor: OKLCH
  accentColor?: OKLCH
  mode?: "light" | "dark"
}

export function ColorScalePreview({
  primaryColor,
  accentColor,
  mode = "light",
}: ColorScalePreviewProps) {
  const [copied, setCopied] = useState(false)

  const primaryScale = useMemo(
    () => deriveScale(primaryColor, mode),
    [primaryColor, mode]
  )
  const accentScale = useMemo(
    () => (accentColor ? deriveScale(accentColor, mode) : null),
    [accentColor, mode]
  )

  const generateCss = () => {
    const lines: string[] = [":root {"]
    SCALE_STEPS.forEach((step) => {
      lines.push(`  --color-primary-${step}: ${toCss(primaryScale[step])};`)
    })
    if (accentScale) {
      SCALE_STEPS.forEach((step) => {
        lines.push(`  --color-accent-${step}: ${toCss(accentScale[step])};`)
      })
    }
    lines.push("}")
    return lines.join("\n")
  }

  const cssOutput = generateCss()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cssOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-foreground">
          CSS Custom Properties
        </h4>
        <button
          onClick={handleCopy}
          className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted/60 transition-colors font-medium"
        >
          {copied ? "Copied!" : "Copy CSS"}
        </button>
      </div>
      <div className="rounded-lg bg-muted/50 border border-border overflow-hidden">
        <div className="px-3 py-2 bg-muted/60 border-b border-border flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-400/60" />
            <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
            <div className="w-2 h-2 rounded-full bg-green-400/60" />
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            theme.css
          </span>
        </div>
        <pre className="p-4 text-[11px] font-mono leading-relaxed text-foreground/80 overflow-x-auto max-h-64">
          {cssOutput}
        </pre>
      </div>
    </div>
  )
}

export interface ColorScaleViewerProps extends ColorScalePreviewProps {
  previewTab?: "scale" | "components" | "tokens"
  onPreviewTabChange?: (tab: "scale" | "components" | "tokens") => void
}

export function ColorScaleViewer({
  primaryColor,
  accentColor,
  mode = "light",
  previewTab = "scale",
  onPreviewTabChange,
}: ColorScaleViewerProps) {
  const primaryScale = useMemo(
    () => deriveScale(primaryColor, mode),
    [primaryColor, mode]
  )
  const accentScale = useMemo(
    () => (accentColor ? deriveScale(accentColor, mode) : null),
    [accentColor, mode]
  )

  const tabs = [
    { id: "scale" as const, label: "Scales" },
    { id: "components" as const, label: "Semantic" },
    { id: "tokens" as const, label: "Tokens" },
  ]

  const handleTabChange = (tab: (typeof tabs)[0]["id"]) => {
    onPreviewTabChange?.(tab)
  }

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              previewTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {previewTab === "scale" && (
        <div className="space-y-6">
          <ScaleRow label="Primary" scale={primaryScale} />
          {accentScale && (
            <ScaleRow label="Accent" scale={accentScale} accent />
          )}
        </div>
      )}

      {previewTab === "components" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Semantic scales derived from primary chroma (C=
            {primaryColor.c.toFixed(2)})
          </p>
          <div className="space-y-2">
            <SemanticRow
              label="Success"
              hue={140}
              chroma={primaryColor.c}
              mode={mode}
            />
            <SemanticRow
              label="Warning"
              hue={50}
              chroma={primaryColor.c}
              mode={mode}
            />
            <SemanticRow
              label="Destructive"
              hue={15}
              chroma={primaryColor.c}
              mode={mode}
            />
            <SemanticRow
              label="Info"
              hue={210}
              chroma={primaryColor.c}
              mode={mode}
            />
            <SemanticRow label="Neutral" hue={240} chroma={0.03} mode={mode} />
          </div>
          <div className="text-[10px] text-muted-foreground p-2 rounded bg-muted/40 border border-border">
            Semantic colors inherit chroma from your primary for consistent
            saturation across the palette.
          </div>
        </div>
      )}

      {previewTab === "tokens" && (
        <ColorScalePreview
          primaryColor={primaryColor}
          accentColor={accentColor}
          mode={mode}
        />
      )}
    </div>
  )
}
