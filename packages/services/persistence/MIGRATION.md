# Planned migration from the current Zustand persistence layer

The current `services/zustand/src/persistence` mixes generic persistence infrastructure with Zustand ownership. Migration is intentionally staged: existing implementations remain available until each active consumer is characterized and moved. The target separates generic storage from Zustand integration.

## Move/rewrite

| Former implementation                | New ownership                                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `createLocalStorageAdapter<T>()`     | `services/persistence.createLocalStorage()` + serializer/persistent value                                                             |
| `createMemoryAdapter<T>()`           | `services/persistence.createMemoryStorage()`                                                                                          |
| `PersistenceAdapter<T>`              | replace with `StringStorage`, `SubscribableStringStorage`, and `PersistentValue<T>`                                                   |
| JSON parsing inside storage adapters | move to `createJsonSerializer()`                                                                                                      |
| `as T` after `JSON.parse`            | replace with feature-owned runtime parser/schema                                                                                      |
| storage subscriptions                | explicit `SubscribableStringStorage` capability                                                                                       |
| `createCookieAdapter()`              | do not migrate into generic persistence; keep cookie integration at app/server boundary until a dedicated cookie service is justified |
| Zustand `persist` integration        | keep in `services/zustand`, consuming persistence primitives where useful                                                             |

## Why the generic adapter will be retired after its consumers migrate

The previous interface combined several unrelated capabilities behind optional methods:

```text
read?
write?
delete?
clear?
subscribe?
```

This makes it impossible for callers to know which capabilities are guaranteed and encourages unrelated storage mechanisms to pretend they are interchangeable.

The replacement uses narrow contracts:

```text
StringStorage
SubscribableStringStorage
Serializer<T>
PersistentValue<T>
SubscribablePersistentValue<T>
```

## Validation change

Former behavior:

```ts
JSON.parse(raw) as T
```

Replacement:

```ts
createJsonSerializer({
  parse: (unknownValue) => schema.parse(unknownValue),
})
```

Persisted state is now checked at the boundary where it becomes trusted application data.
