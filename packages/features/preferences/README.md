# @repo/feature-preferences

Owns active in-memory user preferences. The initial state contains only `appearancePreference`; future preference fields belong here when concrete product behavior requires them.

## Ownership

- Active `appearancePreference`: `light`, `dark`, or `system`
- Provider-isolated Zustand state
- Preference selector and command hooks

This package does not persist state, read cookies, synchronize browser contexts, resolve a color scheme, observe the operating system, mutate the DOM, or define a saved Theme. Persistence machinery belongs to `@repo/services-zustand`; application-specific persistence and bootstrap policy belong to the application composition root.

## Usage

```tsx
"use client"

import {
  PreferencesProvider,
  useAppearancePreference,
  useSetAppearancePreference,
} from "@repo/feature-preferences"

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

## Appearance composition

Feature packages do not import other feature packages. The application composition root reads Preferences and supplies the active value to `AppearanceRuntimeProvider` from `@repo/feature-theme`.

## Verification

```bash
pnpm --filter @repo/feature-preferences test
pnpm --filter @repo/feature-preferences check-types
pnpm --filter @repo/feature-preferences lint
```
