"use client"

import { useThemeScopeStore } from "./theme-scope-context"
import { DEFAULT_THEME_PRIMARY_COLOR } from "./theme-scope-provider"

export function ThemePreview() {
  const primaryColor = useThemeScopeStore(
    (state) => state.overrides.primaryColor ?? DEFAULT_THEME_PRIMARY_COLOR
  )

  return (
    <section
      // className="theme-preview"
      data-primary-color={primaryColor}
      // data-testid="theme-preview"
      aria-label="Theme preview"
    >
      <div>
        <span>Preview badge</span>
        <h2>Scoped surface</h2>
        <p>Representative preview text</p>
        <label>
          Preview input
          <input type="text" placeholder="Type something" />
        </label>
        <div>
          <button type="button">Primary action</button>
          <button type="button">Secondary action</button>
        </div>
      </div>
    </section>
  )
}
