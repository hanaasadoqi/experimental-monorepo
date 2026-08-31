"use client"

import { useState } from "react"
import { ScaleControls } from "./scale-controls"

export function TypographyProse() {
  const [fontStep, setFontStep] = useState(0)

  const handleFontSizeChange = (step: number) => {
    setFontStep(step)
    document.documentElement.style.setProperty(
      "--text-size-step",
      step.toString()
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border border-(--border)">
        <ScaleControls
          fontStep={fontStep}
          onFontStepChange={handleFontSizeChange}
        />
      </div>
      <div className="max-w-prose space-y-4">
        <h2>Typography in Context </h2>
        <p>
          This is a paragraph with the base font size(16px).The line height is
          set to 1.5 for optimal readability.The max width is constrained to 65
          characters for comfortable reading.
        </p>
        <p>
          Typography is the art and technique of arranging type to make written
          language <strong>legible, readable, and appealing </strong> when
          displayed. The arrangement of type involves selecting typefaces, point
          sizes, line lengths, line - spacing, and letter - spacing.
        </p>
        <h3> Code Examples </h3>
        <p>
          You can use inline code like<code>const x = 10; </code> or display
          code blocks:
        </p>
        <pre className="bg-(--muted) p-4 rounded-lg overflow-x-auto">
          <code>
            {`function hello() {
  return "Hello, World!";
}`}
          </code>
        </pre>
        <h4> Lists </h4>
        <p> Unordered lists: </p>
        <ul className="list-disc list-inside">
          <li>First item </li>
          <li> Second item </li>
          <li> Third item </li>
        </ul>
        <p> Ordered lists: </p>
        <ol className="list-decimal list-inside">
          <li>First item </li>
          <li> Second item </li>
          <li> Third item </li>
        </ol>
        <h5> Blockquotes </h5>
        <blockquote className="border-l-4 border-(--primary) pl-4 italic text-(--muted-foreground)">
          "Typography is what language looks like."
        </blockquote>
      </div>
    </div>
  )
}
