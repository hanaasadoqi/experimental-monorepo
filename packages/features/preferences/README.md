# @repo/feature-preferences

Owns active persisted user preferences. The initial state contains only `appearancePreference`; future preference fields belong here when concrete product behavior requires them.

## Ownership

- Active `appearancePreference`: `light`, `dark`, or `system`
- Provider-isolated Zustand state
- Cookie and localStorage persistence adapters
- Cross-tab preference synchronization
- Validated server cookie reads
- Future signed-in-user reconciliation

This package does not resolve a color scheme, observe the operating system, mutate the DOM, or define a saved Theme. Those concerns belong to the Appearance runtime and Theme owner.

## Client usage

```tsx
"use client"

import {
  PreferencesProvider,
  createCookiePreferencesAdapter,
  useAppearancePreference,
  useSetAppearancePreference,
} from "@repo/feature-preferences"

const adapter = createCookiePreferencesAdapter()

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
  return <PreferencesProvider adapter={adapter}>{children}</PreferencesProvider>
}
```

Applications that server-render should create the cookie adapter once inside their client composition module and pass the request-time value through `initialPreference`.

## Server usage

```ts
import { readAppearancePreferenceCookie } from "@repo/feature-preferences/server"

const preference = await readAppearancePreferenceCookie()
```

The server reader validates the cookie against the canonical schema from `@repo/shared-contracts`.

## Appearance composition

Feature packages do not import other feature packages. The application composition root reads Preferences and supplies the active value to `AppearanceRuntimeProvider` from `@repo/feature-theme`.

## Persistence policy

- Cookie is the current web adapter because the server can read it before rendering.
- localStorage is available for client-only compositions.
- When a backend exists, authenticated backend data becomes authoritative and the cookie becomes a bootstrap cache.
- Hydration phases and App Boot integration are intentionally deferred to the Zustand hydration phase documented in `.docs/plans/2026-08-29-architecture-deepening-continuation.md`.

## Verification

```bash
pnpm --filter @repo/feature-preferences test
pnpm --filter @repo/feature-preferences check-types
pnpm --filter @repo/feature-preferences lint
```
