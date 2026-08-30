# @repo/services-context

Tiny React Context infrastructure.

This package standardizes only two semantics:

- **required context**: absence is a programming/configuration error;
- **optional context**: absence is a valid state.

It deliberately does not know about Zustand, features, repositories, or providers' lifecycle rules.

## Required context

```tsx
const {
  Provider: ThemeStoreContextProvider,
  useValue: useThemeStoreApi,
} = createRequiredContext<ThemeStoreApi>("ThemeStoreContext")
```

## Optional context

Use when a missing parent is meaningful, such as resolving an optional parent scope.

```tsx
const {
  Provider: ThemeScopeContextProvider,
  useValue: useParentThemeScope,
} = createOptionalContext<ThemeScope>("ThemeScopeContext")
```

## Boundary

Feature-owned providers create and own feature instances. This package only supplies dependency discovery through the React tree.
