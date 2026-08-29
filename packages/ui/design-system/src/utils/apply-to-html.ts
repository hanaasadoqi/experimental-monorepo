import type { RefObject } from "react"

export const applyToHtml = (
  cssVariables: Record<string, string>,
  element?: RefObject<HTMLElement>
) => {
  const htmlElement = element ? element.current : document.documentElement

  for (const [key, value] of Object.entries(cssVariables)) {
    htmlElement.style.setProperty(`--${key}`, value)
  }
}
