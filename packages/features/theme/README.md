# @repo/feature-theme

Example theme management feature demonstrating proper architecture patterns.

## Overview

This feature shows how to:
- Structure a feature package with owned types and hooks
- Depend on services layer (Zustand for state management)
- Export a public interface
- Test feature functionality

## Usage

```typescript
import { useTheme, useSetTheme, useIsDark } from "@repo/feature-theme"

// Access theme state
const { theme, setTheme, isDark } = useTheme()

// Or use specific hooks
const currentTheme = useCurrentTheme()
const isDark = useIsDark()
const setTheme = useSetTheme()
```

## Architecture

- **Feature-owned types**: `Theme`, `ThemeContextValue`
- **Feature-owned hooks**: Implement business logic using services
- **Services dependency**: Uses `@repo/services-zustand` for state management
- **No UI components**: Feature exports data and hooks only
  - UI components live in consuming application or `@repo/ui-components`

## Patterns Demonstrated

1. **Feature ownership**: Types, hooks, and state belong to the feature
2. **Services composition**: Features depend on services, not vice versa
3. **Clean exports**: Only public interface exposed via `package.json` exports
4. **Type safety**: Full TypeScript types for feature contract
5. **Testability**: Hooks are pure and testable without React components

## When to Use This Pattern

- Reusable business logic across apps
- Cross-feature coordination (multiple apps need same logic)
- Features that benefit multiple products

## When NOT to Use

- One-off features for a single app (keep in app-owned `src/features`)
- Features tightly coupled to specific UI (keep in app)
- Features with no external consumers
