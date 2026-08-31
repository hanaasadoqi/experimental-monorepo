"use client"

import React from "react"
import { SketchPicker } from "react-color"

interface ColorValue {
  r: number
  g: number
  b: number
  a?: number
}

interface SketchPickerColor extends ColorValue {
  hex?: string
  hsl?: { h: number; s: number; l: number }
  hsv?: { h: number; s: number; v: number }
  rgb: ColorValue
}

export interface PickerProps {
  value: ColorValue
  onChange: (color: { h: number; c: number }) => void
}

export function Picker({ value, onChange }: PickerProps) {
  const [displayColorPicker, setDisplayColorPicker] = React.useState(false)
  const [color, setColor] = React.useState(value)

  React.useEffect(() => {
    setColor(value)
  }, [value.r, value.g, value.b])

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker)
  }

  const handleClose = () => {
    setDisplayColorPicker(false)
  }

  const handleChange = (newColor: SketchPickerColor) => {
    setColor(newColor.rgb)

    // const oklch = validateOklch(newColor.rgb)

    let chroma = oklch.chroma

    if (oklch.l > 70) {
      const lightnessFactor = (oklch.l - 52) / 48
      chroma = oklch.c * (1 + lightnessFactor * 3)
    } else if (oklch.l < 40) {
      const darknessFactor = (52 - oklch.l) / 52
      chroma = oklch.c * (1 + darknessFactor * 2)
    }

    chroma = Math.min(0.4, Math.max(0.08, chroma))

    onChange({ h: oklch.h, c: chroma })
  }

  return (
    <div>
      <div
        className="border border-gray-300 rounded bg-white inline-block cursor-pointer"
        onClick={handleClick}
      >
        <div
          className="w-12 h-8 rounded"
          style={{
            backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a || 1})`,
          }}
        />
      </div>
      {displayColorPicker && (
        <div className="absolute z-10">
          <div
            className="fixed top-0 right-0 bottom-0 left-0"
            onClick={handleClose}
          />
          <SketchPicker color={color} onChange={handleChange} />
        </div>
      )}
    </div>
  )
}
