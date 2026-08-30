# @repo/services-zustand

Comprehensive state management infrastructure for Zustand-based stores. Provides typed store creation, persistence, middleware composition, migrations, slices, and advanced selector patterns.

## Features

- ✅ **Type-safe store creation** with full TypeScript support
- ✅ **SSR-safe persistence** with automatic fallbacks for server environments
- ✅ **Composable middleware** for logging, persistence, and custom behaviors
- ✅ **Schema migrations** with version management and safe upgrades
- ✅ **Slice patterns** for modular store composition
- ✅ **Memoized selectors** with reselect-like optimization
- ✅ **Storage adapters** for localStorage, cookies, and in-memory storage

## Quick Start

### Creating a Store

```typescript
import { createStore } from "@repo/services-zustand/store"

interface AppState {
  count: number
  increment: () => void
  decrement: () => void
}

export const useAppStore = createStore<AppState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}))

// Usage in components
const count = useAppStore.getState().count
useAppStore.getState().increment()
```

## Core Modules

### 1. Persistence (SSR-Safe)

Persist state to various storage backends with automatic SSR detection.

```typescript
import { createStore } from "@repo/services-zustand/store"
import { persistMiddleware } from "@repo/services-zustand/middleware"
import { createLocalStorageAdapter } from "@repo/services-zustand/persistence"

interface State {
  count: number
  increment: () => void
}

const adapter = createLocalStorageAdapter<State>("app-state")

export const useStore = create<State>(
  persistMiddleware({
    key: "app-state",
    adapter,
    onRehydrate: (state) => console.log("Rehydrated:", state),
  })((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }))
)
```

#### Available Adapters

- **LocalStorage** (`createLocalStorageAdapter`) - Browser local storage
- **Cookies** (`createCookieAdapter`) - HTTP cookies with max-age
- **Memory** (`createMemoryAdapter`) - In-memory storage (SSR fallback)

#### SSR Safety

All adapters automatically detect non-browser environments:

```typescript
import {
  isBrowser,
  isLocalStorageAvailable,
} from "@repo/services-zustand/utils"

// Gracefully handles server-side rendering
if (isBrowser() && isLocalStorageAvailable()) {
  // Safe to use localStorage
}
```

### 2. Middleware & Composition

Compose middleware for logging, persistence, and custom behaviors.

```typescript
import {
  persistMiddleware,
  loggerMiddleware,
  composeMiddleware,
} from "@repo/services-zustand/middleware"

const combined = composeMiddleware(
  loggerMiddleware({ prefix: "AppStore", logDiff: true }),
  persistMiddleware({ key: "app", adapter }),
)

export const useStore = create(
  combined((set) => ({ ... }))
)
```

#### Logger Middleware

```typescript
import {
  loggerMiddleware,
  devLoggerMiddleware,
} from "@repo/services-zustand/middleware"

// Always logs
const store = create(
  loggerMiddleware({
    prefix: "MyStore",
    logState: true,
    logDiff: true,
    useGrouping: true,
    filter: (update, state) => !update.sensitive, // Skip logging sensitive fields
  })(creator)
)

// Only logs in development
const store = create(devLoggerMiddleware({ prefix: "DevStore" })(creator))
```

### 3. Slice Pattern

Build modular stores by composing independent slices.

```typescript
import { createSlice, composeSlices } from "@repo/services-zustand/slices"

// Define slices independently
const createAuthSlice = (set, get, api) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
})

const createThemeSlice = (set, get, api) => ({
  isDark: false,
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
})

// Compose them
interface AppState extends AuthSlice, ThemeSlice {}

export const useStore = create<AppState>(
  composeSlices(createAuthSlice, createThemeSlice)
)
```

### 4. Schema Migrations

Version and migrate your store schema safely.

```typescript
import { createMigrationPlan } from "@repo/services-zustand/migrations"

const migrations = createMigrationPlan([
  {
    fromVersion: 0,
    toVersion: 1,
    migrate: (state) => ({
      ...state,
      newField: "default",
    }),
    description: "Add newField to store",
  },
  {
    fromVersion: 1,
    toVersion: 2,
    migrate: (state) => ({
      ...state,
      oldField: undefined, // Remove old field
      newName: state.oldName, // Rename field
    }),
    description: "Rename oldName to newName",
  },
])

// Check if migration is possible
if (migrations.canMigrate(0, 2)) {
  const newState = migrations.migrate(oldState, 0, 2)
}
```

### 5. Advanced Selectors

Optimize performance with memoized, derived, and combined selectors.

```typescript
import {
  createSelector,
  createDerivedSelector,
  createCombinedSelector,
  createShallowSelector,
  createComputed,
} from "@repo/services-zustand/selectors"

// Memoized selector - only returns new value if selected value changed
const selectUserAge = createSelector((state) => state.user.age)

// Derived selector - memoize computations
const selectAdultStatus = createDerivedSelector(
  (state) => state.user.age,
  (age) => (age >= 18 ? "adult" : "minor")
)

// Combined selector - select and combine multiple values
const selectUserProfile = createCombinedSelector(
  [
    (state) => state.user.name,
    (state) => state.user.age,
    (state) => state.settings.showProfile,
  ],
  (name, age, showProfile) => ({
    name,
    age,
    visible: showProfile,
  })
)

// Shallow equality selector - compare objects by value
const selectUserData = createShallowSelector((state) => ({
  name: state.user.name,
  email: state.user.email,
}))

// Usage
const age = selectUserAge(useStore.getState())
const status = selectAdultStatus(useStore.getState())

// Computed selector with subscription
const userProfile = createComputed(useStore, selectUserProfile)
userProfile.subscribe((profile) => console.log("Profile changed:", profile))
```

## Real-World Example

```typescript
import create from "zustand"
import { persistMiddleware, devLoggerMiddleware, composeMiddleware } from "@repo/services-zustand/middleware"
import { createLocalStorageAdapter } from "@repo/services-zustand/persistence"
import { composeSlices } from "@repo/services-zustand/slices"
import { createSelector } from "@repo/services-zustand/selectors"

interface User {
  id: string
  name: string
  email: string
}

interface AppState {
  // Auth
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void

  // Theme
  isDark: boolean
  toggleTheme: () => void

  // Notifications
  notifications: string[]
  addNotification: (msg: string) => void
  clearNotifications: () => void
}

// Slices
const createAuthSlice = (set, get, api) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
})

const createThemeSlice = (set) => ({
  isDark: false,
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
})

const createNotificationSlice = (set) => ({
  notifications: [],
  addNotification: (msg) => set((state) => ({
    notifications: [...state.notifications, msg],
  })),
  clearNotifications: () => set({ notifications: [] }),
})

// Selectors
const selectHasUser = createSelector((state: AppState) => state.user !== null)
const selectUserName = createSelector((state: AppState) => state.user?.name ?? "Guest")
const selectThemeClass = createSelector(
  (state: AppState) => state.isDark ? "dark" : "light"
)

// Store with middleware
const adapter = createLocalStorageAdapter<AppState>("app-state")

export const useStore = create<AppState>(
  composeMiddleware(
    devLoggerMiddleware({ prefix: "App" }),
    persistMiddleware({
      key: "app-state",
      adapter,
      version: 1,
    })
  )(
    composeSlices(
      createAuthSlice,
      createThemeSlice,
      createNotificationSlice
    )
  )
)

// Usage
function MyComponent() {
  const user = useStore((state) => state.user)
  const isDark = useStore((state) => state.isDark)

  return (
    <div className={isDark ? "dark" : "light"}>
      <h1>Welcome, {user?.name || "Guest"}</h1>
    </div>
  )
}
```

## API Reference

### Store

- `createStore<T>(creator: StateCreator<T>): Store<T>` - Create a Zustand store

### Persistence

- `createLocalStorageAdapter<T>(key: string): PersistenceAdapter<T>`
- `createCookieAdapter<T>(key: string, options?: CookieAdapterOptions): PersistenceAdapter<T>`
- `createMemoryAdapter<T>(key: string): PersistenceAdapter<T>`

### Middleware

- `persistMiddleware<T>(options: PersistMiddlewareOptions<T>): Middleware<T>`
- `asyncPersistMiddleware<T>(options: AsyncPersistMiddlewareOptions<T>): Middleware<T>`
- `loggerMiddleware<T>(options?: LoggerMiddlewareOptions): Middleware<T>`
- `devLoggerMiddleware<T>(options?: LoggerMiddlewareOptions): Middleware<T>`
- `composeMiddleware<T>(...middlewares: Middleware<T>[]): Middleware<T>`
- `withCondition<T>(condition: boolean | () => boolean, middleware: Middleware<T>): Middleware<T>`

### Slices

- `createSlice<T, U>(creator: SliceCreator<T, U>): SliceCreator<T, U>`
- `composeSlices<T>(...sliceCreators: SliceCreator<T, any>[]): StateCreator<T, []>`
- `mergeSlices<T>(...slices: Partial<T>[]): T`
- `validateSlices<T>(state: T, requiredSlices: (keyof T)[]): boolean`

### Migrations

- `createMigrationPlan(definitions: MigrationDefinition[]): MigrationPlan`
- `createVersionedState<T>(state: T, version: number, meta?: object): VersionedState<T>`
- `extractState<T>(versionedState: VersionedState<T> | T): T`
- `getVersion(state: unknown): number`

### Selectors

- `createSelector<T, U>(selector: Selector<T, U>, equalityFn?: EqualityFn<U>): Selector<T, U>`
- `createDerivedSelector<T, U>(inputSelector: Selector<T, any>, resultSelector: (input: any) => U): Selector<T, U>`
- `createCombinedSelector<T, U extends any[], R>(inputSelectors: Selector<T, any>[], resultSelector: (...inputs: U) => R): Selector<T, R>`
- `createShallowSelector<T, U>(selector: Selector<T, U>): Selector<T, U>`
- `createComputed<T, U>(store: Store<T>, selector: Selector<T, U>): { get(): U; subscribe(callback: (value: U) => void): () => void }`

### Utils

- `isBrowser(): boolean` - Check if running in browser
- `isLocalStorageAvailable(): boolean` - Check if localStorage is accessible
- `isSessionStorageAvailable(): boolean` - Check if sessionStorage is accessible
- `isCookieAvailable(): boolean` - Check if cookies are accessible
- `getEnvironment(): "browser" | "ssr" | "node"` - Get current environment type

// Subscribe to changes
const unsubscribe = useAppStore.subscribe(
(state) => state.count,
(count) => console.log("Count changed:", count)
)

````

### Selectors

```typescript
import { createUseSelector } from "@repo/services-zustand/hooks"

const useSelector = createUseSelector(useAppStore)

// In components
const count = useSelector((state) => state.count)
const incremented = useSelector((state) => state.count + 1)
````

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
- Props drilling avoidance alone (use Context, see `@repo/services-context`)
