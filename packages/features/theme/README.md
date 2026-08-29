# @repo/feature-theme

Appearance and theme management for the monorepo with Zustand-backed persistence, flash-free rendering, and server-side integration.

## Overview

This feature provides a complete appearance management system:
- **Appearance Preferences**: Light, dark, or system-following modes
- **Flash-Free Rendering**: Pre-hydration bootstrap script prevents color scheme flashing
- **Persistent State**: Cookie and localStorage adapters for cross-session persistence
- **Server Integration**: Reads appearance preference from cookies during SSR
- **React 19 Compatible**: Uses `useSyncExternalStore` for proper external store integration

## Quick Start

### Setup in App Layout

```typescript
// apps/web/src/app/layout.tsx
import { ThemeWrapper } from "@repo/feature-theme/components"
import { generateBootstrapScript } from "@repo/feature-theme"
import { readAppearanceCookie } from "@/lib/read-appearance-cookie"

export default async function RootLayout({ children }) {
  const preference = await readAppearanceCookie()
  const bootstrapScript = generateBootstrapScript(preference || "system")

  return (
    <html>
      <head></head>
      <body>
        <ThemeWrapper
          initialPreference={preference}
          bootstrapScript={bootstrapScript}
        >
          {children}
        </ThemeWrapper>
      </body>
    </html>
  )
}
```

### Using Appearance Hooks

```typescript
"use client"

import {
  useAppearancePreference,
  useResolvedColorScheme,
  useSetAppearancePreference,
} from "@repo/feature-theme/hooks"

export function ThemeToggle() {
  const preference = useAppearancePreference()
  const colorScheme = useResolvedColorScheme()
  const setPreference = useSetAppearancePreference()

  return (
    <button
      onClick={() =>
        setPreference(colorScheme === "dark" ? "light" : "dark")
      }
    >
      Current: {colorScheme}
    </button>
  )
}
```

## API Reference

### Types

```typescript
type AppearancePreference = "light" | "dark" | "system"
type ResolvedColorScheme = "light" | "dark"

interface AppearanceState {
  preference: AppearancePreference
  resolvedColorScheme: ResolvedColorScheme
  setPreference(preference: AppearancePreference): void
}
```

### Components

#### `AppearanceProvider`

Isolated provider wrapping an appearance store with lifecycle management.

```typescript
<AppearanceProvider
  adapter={createCookieAppearanceAdapter()}
  initialPreference="light"
  defaultPreference="system"
>
  {children}
</AppearanceProvider>
```

**Props:**
- `adapter`: `AppearancePersistenceAdapter` — Storage backend (localStorage, cookies, etc.)
- `defaultPreference`: `AppearancePreference` — Default when nothing is persisted
- `initialPreference`: `AppearancePreference` — Initial state (usually from server)
- `children`: React nodes

#### `ThemeWrapper`

Convenience component for common setup with bootstrap script injection.

```typescript
<ThemeWrapper
  initialPreference={preference}
  bootstrapScript={bootstrapScript}
  useLocalStorage={false}
>
  {children}
</ThemeWrapper>
```

**Props:**
- `initialPreference`: Server-read preference
- `bootstrapScript`: Pre-hydration script HTML
- `useLocalStorage`: Use localStorage adapter (default: false/cookies)
- `children`: React nodes

### Hooks

#### `useAppearance()`

Returns complete appearance state with automatic subscriptions.

```typescript
const { preference, resolvedColorScheme, setPreference } = useAppearance()
```

#### `useAppearancePreference()`

Returns only the preference string, optimized for selective re-renders.

```typescript
const preference = useAppearancePreference()
```

#### `useResolvedColorScheme()`

Returns the computed color scheme ('light' or 'dark') from preference + system.

```typescript
const colorScheme = useResolvedColorScheme()
```

#### `useSetAppearancePreference()`

Returns a setter function that never triggers component re-render.

```typescript
const setPreference = useSetAppearancePreference()
setPreference("dark")
```

#### `useAppearanceControl()`

Convenience hook returning `[preference, setPreference]` tuple.

```typescript
const [preference, setPreference] = useAppearanceControl()
```

#### `useTheme()` (Deprecated)

Legacy hook for backward compatibility. Use appearance hooks instead.

### Persistence Adapters

#### `createLocalStorageAppearanceAdapter()`

Persists to `localStorage` under `appearance-preference` key. Cross-tab sync via storage events.

```typescript
const adapter = createLocalStorageAppearanceAdapter()
```

#### `createCookieAppearanceAdapter(options?)`

Persists to a cookie for server-side reading during SSR. Cross-tab sync via `BroadcastChannel`.

```typescript
const adapter = createCookieAppearanceAdapter({
  name: "appearance-preference",
  maxAge: 365 * 24 * 60 * 60,
  path: "/",
  sameSite: "Lax",
  secure: true,
})
```

**Options:**
- `name`: Cookie name (default: `'appearance-preference'`)
- `maxAge`: Seconds (default: 1 year)
- `path`: Cookie path (default: `'/'`)
- `sameSite`: Cookie SameSite attribute (default: `'Lax'`)
- `secure`: Mark as Secure (default: auto-detect HTTPS)

### Runtime Utilities

#### `generateBootstrapScript(preference, nonce?)`

Creates a minimal inline script that applies color scheme before hydration.

```typescript
const script = generateBootstrapScript("system", process.env.CSP_NONCE)
// Returns: <script nonce="...">(...)</script>
```

Use in layout head to prevent flash:
```typescript
<head>
  {/* CSP-safe nonce support */}
  <div dangerouslySetInnerHTML={{ __html: bootstrapScript }} />
</head>
```

#### `resolveServerColorScheme(preference)`

Server-side helper that resolves 'system' to 'light' (no matchMedia available).

```typescript
const colorScheme = resolveServerColorScheme(preference)
// Returns: 'light' | 'dark'
```

#### `resolveColorScheme(preference, systemScheme?)`

Client-side resolver using matchMedia for system preference.

```typescript
const colorScheme = resolveColorScheme("system")
// Returns: 'light' | 'dark' based on system preference
```

#### `applyColorScheme(colorScheme, root?)`

Applies color scheme to DOM (classList + data-theme + style.colorScheme).

```typescript
applyColorScheme("dark", document.documentElement)
```

## Architecture

### Store Creation

Each AppearanceProvider creates an isolated Zustand store via:

```typescript
export function createAppearanceStore(
  defaultPreference: AppearancePreference = "system",
  systemScheme: ResolvedColorScheme = "light"
): Store<AppearanceState>
```

Stores created per-provider instance enable testing and multi-provider scenarios.

### Synchronization Lifecycle

The store lifecycle is managed by `synchronizeAppearance()`:

1. **Store changes** → write to adapter (persistence)
2. **Adapter changes** → update store state (cross-tab sync)
3. **System changes** → update resolved color scheme (media query listener)
4. **DOM sync** → apply color scheme to document root

### Flash Prevention

The bootstrap script:
1. Runs before React hydration
2. Applies color scheme to `<html>` element
3. Prevents white/dark flashes during hydration
4. Is minified (<2KiB) and includes XSS escaping

## Integration with Services

This feature uses:
- **`@repo/services-zustand`**: Store creation and persistence adapters (generic utilities now extracted)
- **`@repo/services-context`**: Context provider pattern for injecting stores

Feature-specific logic (AppearancePreference validation, DOM manipulation, synchronization) remains in theme.

## Testing

All hooks and components are tested with:
- Unit tests for store logic
- Provider tests for React integration
- Adapter contract tests for persistence implementations
- 136+ passing tests with >70% coverage

Run tests:
```bash
pnpm test:run
```

## Backward Compatibility

The `useTheme()` hook is preserved for legacy code:

```typescript
// Old API (still works)
const { preference, setTheme } = useTheme()

// New API (preferred)
const preference = useAppearancePreference()
const setPreference = useSetAppearancePreference()
```

## Common Patterns

### Flash-Free Rendering Flow

1. **Server Layout**:
   - Read preference from cookie
   - Generate bootstrap script with preference
   - Inject script in layout head

2. **Client Hydration**:
   - Bootstrap script runs before React
   - Color scheme applied to `<html>`
   - ThemeWrapper hydrates with initial preference
   - No flickering occurs

### Cross-Tab Synchronization

1. **Tab A** changes preference
2. **Adapter** persists to storage (cookie or localStorage)
3. **Other tabs** detect change via BroadcastChannel or storage event
4. **Store** updates, components re-render

### Server-Side Rendering

1. **Layout reads cookie** → gets user's last preference
2. **Bootstrap script** applies preference before hydration
3. **Initial state** passed to AppearanceProvider
4. **Client code** syncs with latest cookie value

## Patterns Demonstrated

1. **Provider-isolated stores**: Each provider instance owns its store
2. **Zustand integration**: Using `useSyncExternalStore` with external stores
3. **Persistence adapters**: Pluggable storage backends with contract testing
4. **Flash-free rendering**: Pre-hydration script with CSP nonce support
5. **Server integration**: Cookie reading during SSR with initial hydration
6. **Selector optimization**: Selective re-renders via custom subscription logic

## When to Use

✅ Use this feature for:
- Appearance/theme management across your app
- Multiple persistence backends (cookies for SSR, localStorage for SPA)
- Server-side rendering with theme preference
- Cross-tab theme synchronization

❌ Don't use for:
- Single-use app-specific state (create in app instead)
- Tightly-coupled UI state (keep in component)
- State without cross-session persistence needs
