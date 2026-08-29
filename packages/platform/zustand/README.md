# @repo/platform-zustand

State management infrastructure for Zustand-based stores. Provides typed store creation utilities and selector patterns.

## Usage

### Creating a Store

```typescript
import { createStore } from "@repo/platform-zustand/store"

interface AppState {
  count: number
  increment: () => void
}

export const useAppStore = createStore<AppState>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }),
  { name: "AppStore" } // DevTools support
)
```

### Using the Store

```typescript
// Get current state
const count = useAppStore.getState().count

// Subscribe to changes
const unsubscribe = useAppStore.subscribe(
  (state) => state.count,
  (count) => console.log("Count changed:", count)
)
```

### Selectors

```typescript
import { createUseSelector } from "@repo/platform-zustand/hooks"

const useSelector = createUseSelector(useAppStore)

// In components
const count = useSelector((state) => state.count)
const incremented = useSelector((state) => state.count + 1)
```

## Key Patterns

- **Typed stores**: Full TypeScript support with inferred types
- **DevTools**: Optional Redux DevTools integration
- **Selectors**: Efficient state selection without subscriptions
- **Simple API**: Minimal wrapper around Zustand's core API

## When to Use

- Complex application state
- Global state needed by multiple features
- Real-time state updates and subscriptions

## When NOT to Use

- Simple component-local state (use React hooks)
- Props drilling avoidance alone (use Context, see `@repo/platform-context`)
