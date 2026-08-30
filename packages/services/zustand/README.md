# @repo/services-zustand reference toolkit

A deliberately small Zustand infrastructure package for a monorepo with many feature-owned stores.

## Public surfaces

- `@repo/services-zustand` — vanilla lifecycle + slice factories
- `@repo/services-zustand/persist` — sequential migrations, clear persisted state, storage-event rehydration
- `@repo/services-zustand/hydration` — rehydrate / inspect / subscribe to hydration
- `@repo/services-zustand/react` — store Context, bound selector hooks, provider factory, hydration hooks
- `@repo/services-zustand/testing` — reset registry
- `@repo/services-zustand/factories` — reusable domain-agnostic state mechanics

## Ownership rule

The service owns mechanics. Features still own state shape, actions, persistence keys, `partialize`, migration contents, validation schemas, and user-facing reset semantics.

## Typical persisted-store flow

1. Feature creates a vanilla `StoreApi` with Zustand `persist` and `skipHydration: true`.
2. Feature declares `version`, `partialize`, storage key, and sequential migrations.
3. React provider owns exactly one store instance.
4. `useRehydrateStore(store)` starts client hydration.
5. `useStoreHydration(store)` exposes hydration status when UI needs it.
6. `subscribeToStorageRehydration(store)` optionally keeps tabs synchronized.

See `examples/preferences` and `examples/theme`.
