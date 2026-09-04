"use client"

import * as React from "react"
import dynamic from "next/dynamic"

import { ColorResult } from "react-color"
import { useClickOutside } from "@/hooks/use-click-outside"
import { toRgb, isValidOklch, converter } from "@repo/domain-theme"
import {
  oklchToRgbaObj,
  rgbaObjToOklchStr,
  type Rgba,
} from "../../../lib/rgba-oklch"
// import { HarmonyPicker } from "@repo/ui-theme";

const SketchPicker = dynamic(
  () => import("react-color").then((mod) => ({ default: mod.SketchPicker })),
  {
    ssr: false,
  }
)

type ColorPickerProps = {
  color: string
  onChange: (color: string) => void
  label?: string
}

export function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const popoverRef = React.useRef<HTMLElement | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)
  const [textInput, setTextInput] = React.useState(color)
  const onPickerChange = (color: ColorResult) =>
    onDynamicPickerChange({
      r: color.rgb.r,
      g: color.rgb.g,
      b: color.rgb.b,
      a: color.rgb.a ?? 1,
    })

  React.useEffect(() => {
    if (!isValidOklch(color)) return
  }, [color])

  const close = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  const rgbaColor = React.useMemo(() => {
    const okColor = isValidOklch(color) ? color : "oklch(0.64 0.14 250)"
    const oklchColor = converter("oklch")(okColor)
    return oklchColor ? toRgb(oklchColor) : { r: 1, g: 1, b: 1, a: 1 }
  }, [color])

  const commitTextInput = React.useCallback(() => {
    if (textInput) {
      onChange(rgbaObjToOklchStr(oklchToRgbaObj(textInput)))
      return
    }

    setTextInput(color)
  }, [color, onChange, textInput])

  const onDynamicPickerChange = React.useCallback(
    (nextRgba: Rgba) => {
      onChange(rgbaObjToOklchStr(nextRgba))
    },
    [onChange]
  )

  useClickOutside(popoverRef, close, {
    enabled: isOpen,
  })

  const textInputIsValid = textInput.length === 0 || isValidOklch(textInput)

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Open color picker"
        className="border-border h-8 w-8 cursor-pointer rounded border hover:shadow-sm"
        style={{ backgroundColor: color }}
        onClick={() => setIsOpen(true)}
      />
      <div className="flex gap-4">
        {/* <ColorPicker color={rgbaColor} onChange={onPickerChange} /> */}
        <SketchPicker color={rgbaColor} onChange={onPickerChange} />
      </div>
      {isOpen && (
        <div
          ref={popoverRef as React.RefObject<HTMLDivElement>}
          className="border-border bg-popover absolute top-full left-0 z-50 mt-2 rounded-sm border p-3 shadow-sm"
        >
          <label className="mt-3 block space-y-1.5">
            <span className="text-muted-foreground text-xs font-medium">
              {label ?? "Primary Color (OKLCH)"}
            </span>
            <input
              className="bg-background h-10 w-full rounded-md border px-3 font-mono text-sm"
              value={textInput}
              onChange={(event) => setTextInput(event.target.value)}
              onBlur={commitTextInput}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  commitTextInput()
                  event.currentTarget.blur()
                }

                if (event.key === "Escape") {
                  setTextInput(color)
                  event.currentTarget.blur()
                }
              }}
            />
            {!textInputIsValid ? (
              <p className="text-destructive text-xs">Use valid OKLCH.</p>
            ) : null}
          </label>
        </div>
      )}
    </div>
  )
}
