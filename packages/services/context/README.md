# @repo/services-context

React Context API infrastructure for simple or local state patterns.

## Exports

- **`./providers`** — Context + Provider factory utilities
- **`./hooks`** — Safe consumer hooks with error handling
- **`./types`** — Context type patterns

## Key Features

- Factory for creating Context + Provider combos
- Type-safe consumer hooks
- Error handling for missing providers
- Provider composition patterns
- No business logic — infrastructure only

## When to Use

- Local feature state
- Avoiding prop drilling in component trees
- Simple state that doesn't need global management

## When NOT to Use

- Complex global state (use Zustand, see `@repo/services-zustand`)
- Cross-feature state sharing (feature-owned + services-zustand)
- Performance-critical re-render avoidance (context triggers all subscribers)
