"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui-components/base/card"

const COLOR_VARIANTS = [
  "--background",
  "--foreground",
  "--primary",
  "--secondary",
  "--muted",
  "--accent",
  "--border",
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
]

export function TypographyPreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Style Overview</CardTitle>
        <CardDescription className="line-clamp-2">
          Designers love packing quirky glyphs into test phrases. This is a
          preview of the typography styles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-3">
          {COLOR_VARIANTS.map((variant) => (
            <div
              key={variant}
              className="flex flex-col flex-wrap items-center gap-2"
            >
              <div
                className="relative aspect-square w-full rounded-lg bg-(--color) after:absolute after:inset-0 after:rounded-lg after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten"
                style={
                  {
                    "--color": `var(${variant})`,
                  } as React.CSSProperties
                }
              />
              <div className="hidden max-w-14 truncate font-mono text-[0.60rem] md:block">
                {variant}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
