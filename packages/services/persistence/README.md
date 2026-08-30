# @repo/services-persistence

Generic client-side persistence infrastructure for Synapcity.

This package owns **storage mechanics, serialization, runtime validation hooks, and bound persistent values**. It does not own feature schemas, repositories, cookies, databases, or Zustand state.

## Design rules

- Persisted bytes/strings are untrusted input.
- Feature/domain schemas stay feature-owned.
- Storage and serialization are separate capabilities.
- High-level persistence APIs are Promise-based even when the underlying storage is synchronous.
- Storage subscriptions are modeled as an explicit capability rather than an optional method on every adapter.
- Cookies are intentionally excluded because browser cookies, server cookies, HttpOnly cookies, and Next.js request/response cookies do not share localStorage semantics.

## Package shape

```text
src/
├── errors/
├── serialization/
├── storage/
├── value/
└── testing/
```

## Storage

`StringStorage` is the lowest-level abstraction:

```ts
interface StringStorage {
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
  removeItem(key: string): void | Promise<void>
}
```

The package ships:

- `createLocalStorage()` — browser localStorage with same-context and cross-tab subscriptions.
- `createMemoryStorage()` — deterministic in-memory storage for tests, SSR fallbacks chosen by callers, and temporary persistence.

`createLocalStorage()` throws a `PersistenceError` when localStorage is unavailable rather than silently treating storage failure as missing data.

## Runtime validation

The package does not depend on Zod. Instead, `createJsonSerializer` accepts any parser with the shape `(unknown) => T`:

```ts
import { createJsonSerializer } from "@repo/services-persistence/serialization"
import { preferencesSchema } from "@repo/feature-preferences"

const serializer = createJsonSerializer({
  parse: (value) => preferencesSchema.parse(value),
})
```

This keeps the dependency direction correct:

```text
feature schema
    ↓
services/persistence
```

Persistence never imports feature contracts.

## Bound persistent values

Use `createPersistentValue` to bind a semantic key, storage implementation, and serializer:

```ts
const preferencesStorage = createPersistentValue({
  key: "synapcity.preferences",
  storage: createLocalStorage(),
  serializer: createJsonSerializer({
    parse: (value) => preferencesSchema.parse(value),
  }),
})

await preferencesStorage.write(preferences)
const restored = await preferencesStorage.read()
```

Feature repositories can compose this primitive without persistence knowing feature semantics:

```text
ThemeRepository
      ↑
LocalThemeRepository
      ↓
PersistentValue<ThemeLibraryData>
      ↓
StringStorage + Serializer
```

## Subscriptions

`SubscribableStringStorage` is a separate capability. `createLocalStorage()` emits:

- same-context changes made through any adapter instance for the same window,
  and
- native `storage` events from other same-origin browsing contexts.

The browser's native `storage` event itself does not fire in the document that made the change; the adapter explicitly supplies local notifications so consumers get one coherent subscription API.

Subscriptions describe changes, not method calls. Writing the current value or
removing an absent key does not notify. A cross-context `localStorage.clear()`
event notifies every subscribed key with `null`.

Every subscription requires an error reporter. Listener and reporter failures
are isolated from storage mutations: once storage has committed a change,
observer code cannot turn that successful mutation into a failed write. Each
call to `subscribe()` owns an independent registration, even when callbacks are
reused, and unsubscription is idempotent.

Use `createSubscribablePersistentValue()` when you need validated typed subscriptions.

## What does not belong here

- `ThemeRepository`, `PreferencesRepository`, etc. — feature-owned ports/adapters.
- Zustand `persist` middleware — `services/zustand` integration.
- Next.js `cookies()` or document-cookie abstractions.
- Database access.
- API transport.
- Feature schemas/types.

## Future additions

Add these only once real consumers prove the need:

- generic versioned serialization/migration support for non-Zustand persisted data
- IndexedDB adapter
- sessionStorage adapter
- storage observability/metrics
