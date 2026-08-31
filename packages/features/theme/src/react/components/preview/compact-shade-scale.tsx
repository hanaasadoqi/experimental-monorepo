"use client"

import { parseOklab } from "culori"

export type ScaleStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
export const SCALE_STEPS: ScaleStep[] = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
]

type ColorScale = Record<ScaleStep, string>

export function CompactShadeScale(scales: ColorScale[]) {
  return (
    <div className="px-3 pb-3 space-y-1.5">
      {scales.map((scale) => (
        <div className="flex rounded-lg overflow-hidden h-2">
          {Object.entries(scale).map(([key, value]) => {
            const parsedValue = parseOklab?.(value)
            const foreground =
              parsedValue && parsedValue.l > 0.5 ? "black" : "white"
            return (
              <div
                key={key}
                className="flex-1"
                style={{
                  backgroundColor: value,
                  color: JSON.stringify(foreground),
                }}
              >
                <span className="sr-only">
                  {key}: {value}
                </span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
