# @repo/features-preferences

Owns active in-memory user preferences. The initial state contains only `appearancePreference`; future preference fields belong here when concrete product behavior requires them.

## Ownership

- Active `appearancePreference`: `light`, `dark`, or `system`
- Provider-isolated state management
- Preference selector and command hooks

This package does not persist state, read cookies, synchronize browser contexts, resolve a color scheme, observe the operating system, mutate the DOM, or define a saved Theme. Persistence machinery belongs to adapters; application-specific persistence and bootstrap policy belong to the application composition root.

## Usage

```tsx
"use client"

import {
  PreferencesProvider,
  useAppearancePreference,
  useSetAppearancePreference,
} from "@repo/features-preferences"

function PreferenceControl() {
  const preference = useAppearancePreference()
  const setPreference = useSetAppearancePreference()

  return (
    <button onClick={() => setPreference("dark")}>
      Current preference: {preference}
    </button>
  )
}

export function PreferencesRoot({ children }: { children: React.ReactNode }) {
  return <PreferencesProvider>{children}</PreferencesProvider>
}
```

Applications that server-render may pass validated request-time intent through `initialPreference`. Reading and persisting that intent remain application responsibilities.

## Verification

```bash
pnpm --filter @repo/features-preferences test:run
pnpm --filter @repo/features-preferences check-types
pnpm --filter @repo/features-preferences lint
```
