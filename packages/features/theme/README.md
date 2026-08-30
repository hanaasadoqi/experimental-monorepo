# @repo/feature-theme

Derived Appearance runtime and Theme compatibility for the monorepo, including operating-system resolution, atomic DOM synchronization, and flash-free bootstrap generation.

> **Ownership update:** Active persisted intent now belongs to `@repo/feature-preferences`. Canonical applications compose Preferences into `AppearanceRuntimeProvider`. `AppearanceProvider`, ThemeWrapper, and the feature-theme persistence adapters remain compatibility interfaces until the documented cleanup phase.

> **The Appearance API is canonical.** Use `AppearanceProvider` and the `useAppearance*` hooks. The `Theme`-prefixed exports (`ThemeProvider`, `useTheme`, `themeStore`, `Theme`) are deprecated compatibility shims scheduled for removal in v2.0 — see [Migration Guide](#migration-guide). Full guide: [`.docs/guides/appearance-api.md`](../../../.docs/guides/appearance-api.md).

## Overview

This feature provides the derived Appearance behavior:

- **Appearance Preferences**: Light, dark, or system-following modes
- **Flash-Free Rendering**: Pre-hydration bootstrap script prevents color scheme flashing
- **Controlled Runtime**: Projects active Preferences into resolved Appearance
- **Compatibility**: Existing persistence and Theme-named interfaces remain available during migration
- **React 19 Compatible**: Uses `useSyncExternalStore` for proper external store integration

## Quick Start

### Canonical application composition

```typescript
"use client"

import {
  useAppearancePreference,
  useSetAppearancePreference,
} from "@repo/feature-preferences"
import { AppearanceRuntimeProvider } from "@repo/feature-theme"

export function AppearanceBridge({ children }) {
  const preference = useAppearancePreference()
  const setPreference = useSetAppearancePreference()

  return (
    <AppearanceRuntimeProvider
      preference={preference}
      onPreferenceChange={setPreference}
    >
      {children}
    </AppearanceRuntimeProvider>
  )
}
```

### Using Appearance Hooks

```typescript
"use client"

import { useSetAppearancePreference } from "@repo/feature-preferences/hooks"
import { useResolvedColorScheme } from "@repo/feature-theme/hooks"

export function ThemeToggle() {
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

#### `useTheme()` (Deprecated — removed in v2.0)

Compatibility shim returning `{ preference, setTheme }`. Forwards to
`useAppearancePreference()` and `useSetAppearancePreference()`. See
[Migration Guide](#migration-guide).

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

## Migration Guide

Every `Theme`-prefixed export forwards to the canonical Appearance API and still
works in v1.x. Each carries an `@deprecated` tag, so editors flag call sites.

| Deprecated          | Canonical replacement                                         |
| ------------------- | ------------------------------------------------------------- |
| `ThemeProvider`     | `AppearanceProvider` (or `ThemeWrapper` for the common setup) |
| `useTheme()`        | `useAppearance()` / `useAppearancePreference()`               |
| `themeStore`        | The per-tree store owned by `AppearanceProvider`              |
| `Theme`             | `AppearancePreference`                                        |
| `ThemeContextValue` | `AppearanceState`                                             |
| `ThemeConfig`       | No replacement — the provider owns the system media query     |

### Provider

```tsx
// Before (deprecated)
<ThemeProvider defaultTheme="system">{children}</ThemeProvider>

// After (canonical)
<AppearanceProvider
  adapter={createCookieAppearanceAdapter()}
  defaultPreference="system"
>
  {children}
</AppearanceProvider>
```

`ThemeProvider` only toggles the `dark` class. `AppearanceProvider` additionally
owns persistence, the system media query, and cross-tab synchronization, so the
migration also removes wiring you previously had to supply yourself.

### Hook

```typescript
// Before (deprecated)
const { preference, setTheme } = useTheme()

// After (canonical)
const { preference, resolvedColorScheme, setPreference } = useAppearance()

// Or, for selective re-renders
const preference = useAppearancePreference()
const setPreference = useSetAppearancePreference()
```

`useTheme()` cannot expose `resolvedColorScheme` — the resolved `light`/`dark`
value after `system` is applied. Reach for `useResolvedColorScheme()` when you
need to render the current scheme rather than the stated preference.

### Deprecation Timeline

- **v1.x** — Appearance is canonical; the Theme API is deprecated but fully
  functional. No breaking changes.
- **v2.0** — The Theme API is removed. Migrate before upgrading.

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
