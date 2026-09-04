"use client"

import { Oklch } from "@repo/domain-theme/color"
import { cn } from "@repo/ui-components/lib/index"
import {
  type ColorHarmonyResult,
  getColorHarmonies,
  OklchSliders,
  toCss,
  useOklchColor,
} from "@repo/ui-theme"
import { memo, useCallback, useState } from "react"
import { HuePresetGrid } from "./hue-preset-grid"

import { ContrastIndicator } from "../colors/contrast-indicator"
import { useResolvedAppearance } from "@/hooks"

// ─── Color Dot (memoized) ────────────────────────────────────────────────────

type ColorDotProps = {
  color: Oklch
  onSelect: (e: React.MouseEvent) => void
  harmonyName: string
  index: number
}

const ColorDot = memo(function ColorDot({
  color,
  onSelect,
  harmonyName,
  index,
}: ColorDotProps) {
  return (
    <button
      type="button"
      className="h-5 w-5 rounded-full border border-white/20 shadow-sm transition-transform hover:scale-110"
      style={{ backgroundColor: toCss(color) }}
      onClick={onSelect}
      title={`Use ${harmonyName} color ${index + 1}`}
    />
  )
})

// ─── Harmony Option (memoized) ────────────────────────────────────────────────

type HarmonyOptionProps = {
  harmony: ColorHarmonyResult
  isSelected: boolean
  onToggle: (harmony: ColorHarmonyResult) => void
  onColorSelect: (harmony: ColorHarmonyResult, index: number) => (e: React.MouseEvent) => void
}

const HarmonyOption = memo(function HarmonyOption({
  harmony,
  isSelected,
  onToggle,
  onColorSelect,
}: HarmonyOptionProps) {
  return (
    <div
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition-all",
        isSelected
          ? "border-primary/60 bg-primary/5"
          : "border-border hover:border-border/80 hover:bg-muted/40"
      )}
      onClick={() => onToggle(harmony)}
    >
      {/* Color dots */}
      <div className="flex shrink-0 gap-1">
        {harmony.colors.map((c, i) => (
          <ColorDot
            key={i}
            color={c}
            onSelect={onColorSelect(harmony, i)}
            harmonyName={harmony.name}
            index={i}
          />
        ))}
      </div>
      {/* Label */}
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-xs font-medium">
          {harmony.name}
        </p>
        <p className="text-muted-foreground truncate text-[10px]">
          {harmony.description}
        </p>
      </div>
      {isSelected && (
        <div className="bg-primary h-2 w-2 shrink-0 rounded-full" />
      )}
    </div>
  )
})

// ─── Harmony Picker ──────────────────────────────────────────────────────────

type HarmonyPickerProps = {
  harmonies: ColorHarmonyResult[]
  accent: Oklch | null
  setAccentFromHarmony: (harmony: ColorHarmonyResult, index: number) => void
  harmonyType: string | null
  clearAccent: () => void
  setHarmonyType: (type: string | null) => void
}

function HarmonyPicker({
  harmonies,
  accent,
  setAccentFromHarmony,
  harmonyType,
  clearAccent,
  setHarmonyType,
}: HarmonyPickerProps) {
  const handleClear = useCallback(() => {
    clearAccent()
  }, [clearAccent])

  const handleHarmonyToggle = useCallback(
    (harmony: ColorHarmonyResult) => {
      if (harmonyType === harmony.type) {
        clearAccent()
        setHarmonyType(null)
      } else {
        setAccentFromHarmony(harmony, 0)
        setHarmonyType(harmony.type)
      }
    },
    [harmonyType, clearAccent, setHarmonyType, setAccentFromHarmony]
  )

  const handleColorSelect = useCallback(
    (harmony: ColorHarmonyResult, index: number) => (e: React.MouseEvent) => {
      e.stopPropagation()
      setAccentFromHarmony(harmony, index)
      setHarmonyType(harmony.type)
    },
    [setAccentFromHarmony, setHarmonyType]
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Accent Harmony
        </span>
        {accent && (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground text-[10px] transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="space-y-1.5">
        {harmonies.map((harmony) => (
          <HarmonyOption
            key={harmony.type}
            harmony={harmony}
            isSelected={harmonyType === harmony.type}
            onToggle={handleHarmonyToggle}
            onColorSelect={handleColorSelect}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Color Editor Panel ───────────────────────────────────────────────────────

export function ColorEditor() {
  const resolvedMode = useResolvedAppearance()
  const { color: primary, setColor: setPrimary } = useOklchColor({
    l: 0.5,
    c: 0.1,
    h: 0,
  })
  // Accent starts unset: `accent` still resolves to a renderable color, and
  // `isAccentEnabled` reports whether the user has actually chosen one.
  const {
    color: accent,
    setColor: setAccent,
    isSet: isAccentEnabled,
    clear: clearAccentColor,
  } = useOklchColor()
  const harmonies = getColorHarmonies(primary)
  const [harmonyType, setHarmonyType] = useState<string | null>(null)

  const clearAccent = () => {
    clearAccentColor()
    setHarmonyType(null)
  }

  const setAccentFromHarmony = (harmony: ColorHarmonyResult, index: number) => {
    const color = harmony.colors[index]
    if (!color) {
      setHarmonyType(null)
      return
    }

    setHarmonyType(harmony.type)
    setAccent(color)
  }

  return (
    <div className="space-y-6">
      {/* Primary Color */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div
            className="border-border h-4 w-4 rounded-full border shadow-sm"
            style={{ backgroundColor: toCss(primary) }}
          />
          <h3 className="text-foreground text-sm font-semibold">
            Primary Color
          </h3>
        </div>
        <HuePresetGrid color={primary} onColorSelect={setPrimary} />
        <OklchSliders
          color={primary}
          onChange={setPrimary}
          mode={resolvedMode}
        />
        <ContrastIndicator color={primary} />
      </section>

      <div className="border-border border-t" />

      {isAccentEnabled && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            {isAccentEnabled ? (
              <div
                className="border-border h-4 w-4 rounded-full border shadow-sm"
                style={{ backgroundColor: toCss(accent) }}
              />
            ) : (
              <div className="border-border h-4 w-4 rounded-full border-2 border-dashed" />
            )}
            <h3 className="text-foreground text-sm font-semibold">
              Accent Color
            </h3>
            {!isAccentEnabled && (
              <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[10px]">
                Optional
              </span>
            )}
          </div>

          <HarmonyPicker
            harmonies={harmonies}
            accent={isAccentEnabled ? accent : null}
            setAccentFromHarmony={setAccentFromHarmony}
            harmonyType={harmonyType}
            clearAccent={clearAccent}
            setHarmonyType={setHarmonyType}
          />

          <ContrastIndicator color={accent} />
        </section>
      )}
    </div>
  )
}
