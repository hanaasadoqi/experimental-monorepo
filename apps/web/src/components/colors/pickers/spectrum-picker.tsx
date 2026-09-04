"use client"

import {
  MAX_CHROMA,
  clampC,
  clampL,
  oklchToHex,
  oklchToRgbBytes,
} from "@repo/domain-theme"
import { useCallback, useEffect, useRef } from "react"

const RES = 48

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
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    canvas.width = RES
    canvas.height = RES
    const image = ctx.createImageData(RES, RES)

    for (let y = 0; y < RES; y++) {
      const rowL = clampL(1 - y / (RES - 1))
      for (let x = 0; x < RES; x++) {
        const cellC = clampC((x / (RES - 1)) * MAX_CHROMA)
        const [r, g, b] = oklchToRgbBytes({ l: rowL, c: cellC, h })
        const i = (y * RES + x) * 4
        image.data[i] = r
        image.data[i + 1] = g
        image.data[i + 2] = b
        image.data[i + 3] = 255
      }
    }
    ctx.putImageData(image, 0, 0)
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
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        draggingRef.current = true
        handlePointer(e.clientX, e.clientY)
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) handlePointer(e.clientX, e.clientY)
      }}
      onPointerUp={(e) => {
        draggingRef.current = false
        e.currentTarget.releasePointerCapture(e.pointerId)
      }}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 0.05 : 0.01
        if (e.key === "ArrowRight") onChange(l, clampC(c + step * MAX_CHROMA))
        else if (e.key === "ArrowLeft")
          onChange(l, clampC(c - step * MAX_CHROMA))
        else if (e.key === "ArrowUp") onChange(clampL(l + step), c)
        else if (e.key === "ArrowDown") onChange(clampL(l - step), c)
        else return
        e.preventDefault()
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
