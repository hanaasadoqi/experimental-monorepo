"use client"

import {
  MAX_CHROMA,
  clampC,
  clampL,
  oklchToHex,
  oklchToRgbBytes,
} from "@repo/domain-theme"
import { useCallback, useEffect, useRef } from "react"

const RESOLUTION = 48

type SpectrumPickerProps = {
  l: number
  c: number
  h: number
  onChange: (l: number, c: number) => void
  compact?: boolean
}

/**
 * A 2D chroma x lightness plane rendered at the current hue. Chroma runs
 * left to right, lightness runs bottom to top. Click or drag to select.
 */
export function SpectrumPicker({
  l,
  c,
  h,
  onChange,
  compact = false,
}: SpectrumPickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    canvas.width = RESOLUTION
    canvas.height = RESOLUTION
    const image = context.createImageData(RESOLUTION, RESOLUTION)

    for (let y = 0; y < RESOLUTION; y++) {
      const rowL = clampL(1 - y / (RESOLUTION - 1))
      for (let x = 0; x < RESOLUTION; x++) {
        const cellC = clampC((x / (RESOLUTION - 1)) * MAX_CHROMA)
        const [red, green, blue] = oklchToRgbBytes({ l: rowL, c: cellC, h })
        const index = (y * RESOLUTION + x) * 4
        image.data[index] = red
        image.data[index + 1] = green
        image.data[index + 2] = blue
        image.data[index + 3] = 255
      }
    }
    context.putImageData(image, 0, 0)
  }, [h])

  const handlePointer = useCallback(
    (clientX: number, clientY: number) => {
      const rect = wrapperRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
      onChange(clampL(1 - y), clampC(x * MAX_CHROMA))
    },
    [onChange]
  )

  const thumbHex = oklchToHex({ l, c, h })
  const thumbLeft = `${Math.min(1, Math.max(0, c / MAX_CHROMA)) * 100}%`
  const thumbTop = `${(1 - Math.min(1, Math.max(0, l))) * 100}%`

  return (
    <div
      ref={wrapperRef}
      role="slider"
      aria-valuenow={c}
      aria-label="Chroma and lightness spectrum"
      aria-valuetext={`Lightness ${l.toFixed(2)}, chroma ${c.toFixed(3)}`}
      tabIndex={0}
      className={`border-border/70 relative h-32 w-full touch-none overflow-hidden rounded-sm border select-none ${compact ? "sm:h-36" : "sm:h-56"}`}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        draggingRef.current = true
        handlePointer(event.clientX, event.clientY)
      }}
      onPointerMove={(event) => {
        if (draggingRef.current) handlePointer(event.clientX, event.clientY)
      }}
      onPointerUp={(event) => {
        draggingRef.current = false
        event.currentTarget.releasePointerCapture(event.pointerId)
      }}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 0.05 : 0.01
        if (event.key === "ArrowRight")
          onChange(l, clampC(c + step * MAX_CHROMA))
        else if (event.key === "ArrowLeft")
          onChange(l, clampC(c - step * MAX_CHROMA))
        else if (event.key === "ArrowUp") onChange(clampL(l + step), c)
        else if (event.key === "ArrowDown") onChange(clampL(l - step), c)
        else return
        event.preventDefault()
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden
      />
      <div
        aria-hidden
        className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_1px_3px_rgba(0,0,0,0.4)]"
        style={{ left: thumbLeft, top: thumbTop, backgroundColor: thumbHex }}
      />
    </div>
  )
}
