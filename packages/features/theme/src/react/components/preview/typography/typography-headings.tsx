"use client"

import { useState } from "react"
import { ScaleControls } from "./scale-controls"

export function TypographyHeadings() {
  const [fontStep, setFontStep] = useState(0)

  const handleFontSizeChange = (step: number) => {
    setFontStep(step)
    document.documentElement.style.setProperty(
      "--text-size-step",
      step.toString()
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-(--muted)/30 p-4 rounded-lg border border-(--border) mb-6">
        <p className="text-sm text-(--muted-foreground) mb-4">
          <strong>Responsive Headings: </strong> Heading sizes automatically
          adjust based on viewport width for optimal readability across devices.
        </p>
        <ScaleControls
          fontStep={fontStep}
          onFontStepChange={handleFontSizeChange}
        />
      </div>
      <div>
        <h1 className="display"> Display </h1>
      </div>
      <div>
        <h1 className="header"> Header </h1>
      </div>
      <div>
        <h1>Heading 1 </h1>
        <p className="text-sm text-(--muted-foreground) mt-2">
          48 - 54px / 3 - 3.375rem - Conservative fluid scaling - Weight:
          Bold(700) - Letter spacing: Tighter
        </p>
      </div>
      <div>
        <h2>Heading 2 </h2>
        <p className="text-sm text-(--muted-foreground) mt-2">
          36 - 40px / 2.25 - 2.5rem - Conservative fluid scaling - Weight:
          Bold(700) - Letter spacing: Tight
        </p>
      </div>
      <div>
        <h3>Heading 3 </h3>
        <p className="text-sm text-(--muted-foreground) mt-2">
          30 - 33px / 1.875 - 2.0625rem - Conservative fluid scaling - Weight:
          Bold(700) - Letter spacing: Tight
        </p>
      </div>
      <div>
        <h4>Heading 4 </h4>
        <p className="text-sm text-(--muted-foreground) mt-2">
          24 - 26px / 1.5 - 1.625rem - Conservative fluid scaling - Weight:
          Semibold(600)
        </p>
      </div>
      <div>
        <h2 className="subheading"> Subheading </h2>
        <h3 className="subheading"> Subheading </h3>
        <h4 className="subheading"> Subheading </h4>
        <p className="text-sm text-(--muted-foreground) mt-2">
          20 - 21px / 1.25 - 1.3125rem - Conservative fluid scaling - Weight:
          Medium(500)
        </p>
      </div>
    </div>
  )
}
