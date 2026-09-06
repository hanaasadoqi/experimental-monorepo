# @repo/runtime-preferences

React preferences runtime — Zustand store, hooks, and provider.

## What's inside

### Provider

```typescript
import { PreferencesProvider } from "@repo/runtime-preferences"

// In layout or root component
<PreferencesProvider initialPreferences={{ appearance: "dark", language: "en" }}>
  {children}
</PreferencesProvider>
```

### Hooks

```typescript
import {
  usePreferences, // all 4 preferences
  useAppearancePreference, // "light" | "dark" | "system"
  useSetAppearancePreference, // setter
  useLanguagePreference, // locale code
  useSetLanguagePreference, // setter
  useDateFormatPreference, // date format
  useSetDateFormatPreference, // setter
  useTimeFormatPreference, // time format
  useSetTimeFormatPreference, // setter
} from "@repo/runtime-preferences"

// In any client component
const appearance = useAppearancePreference()
const setAppearance = useSetAppearancePreference()

setAppearance("dark") // Updates store + localStorage
```

## Architecture

- **Store:** Zustand with persist middleware
  - Server-side hydration from cookies
  - Client-side localStorage sync
  - Cross-tab updates via subscribe
  - `enablePersistence: false` in tests (isolated)

- **Persistence:**
  - appearance + language → cookies (server)
  - dateFormat + timeFormat → localStorage (client)
  - All 4 → localStorage (Zustand persist middleware)

## Data Flow

1. Server loads cookies → passes to `PreferencesProvider`
2. `PreferencesProvider` hydrates Zustand store
3. Persist middleware syncs to localStorage
4. Component uses hooks to read/write preferences
5. Changes sync back to server via API
6. localStorage events sync across tabs

## Usage

### In a Layout (with Server Hydration)

```typescript
// app/layout.tsx
import { readPreferencesCookie } from "@repo/adapters-next"
import { PreferencesProvider } from "@repo/runtime-preferences"

export default async function RootLayout({ children }) {
  const { appearance, language } = await readPreferencesCookie()

  return (
    <html>
      <body>
        <PreferencesProvider initialPreferences={{ appearance, language }}>
          {children}
        </PreferencesProvider>
      </body>
    </html>
  )
}
```

### In a Client Component

```typescript
"use client"

import { useAppearancePreference, useSetAppearancePreference } from "@repo/runtime-preferences"

export function ThemeToggle() {
  const appearance = useAppearancePreference()
  const setAppearance = useSetAppearancePreference()

  return (
    <button onClick={() => setAppearance(appearance === "dark" ? "light" : "dark")}>
      Current: {appearance}
    </button>
  )
}
```

## Testing

```typescript
import { createPreferencesStore } from "@repo/runtime-preferences"
import { renderHook, act } from "@testing-library/react"

it("should isolate preferences in tests", () => {
  const store = createPreferencesStore({
    initialState: { appearance: "light" },
    enablePersistence: false, // ← no localStorage
  })

  const { result } = renderHook(() => store.getState().setAppearance("dark"))

  expect(store.getState().appearance).toBe("dark")
  expect(localStorage.getItem("preferences-store")).toBeNull() // isolated
})
```

## Related

- `@repo/domain-preferences` — types, schemas, validation
- `@repo/adapters-next` — server cookie I/O
- `@repo/ui-preferences` — UI components using these hooks
