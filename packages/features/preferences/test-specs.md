### Model

```text
✓ accepts light
✓ accepts dark
✓ accepts system
✓ rejects invalid values
✓ default preference is valid
```

### Store

```text
✓ initializes with defaults

✓ accepts partial initial state

✓ changes appearance

✓ separate store instances remain isolated

✓ setting one preference does not
  reset unrelated preferences
  once additional fields exist
```

### Provider

This is the test your old package was missing:

```text
✓ hook reads provider-owned store

✓ update through hook updates
  that provider's store

✓ two providers are isolated

✓ consuming without provider throws
```

That **two-provider test** is particularly valuable because it proves you haven't accidentally reintroduced a module-global singleton.

Something conceptually like:

```tsx
<PreferencesProvider
  initialAppearance="light"
>
  <Consumer testId="first" />
</PreferencesProvider>

<PreferencesProvider
  initialAppearance="dark"
>
  <Consumer testId="second" />
</PreferencesProvider>
```

Expected:

```text
first  → light
second → dark
```

Then mutate first:

```text
first  → system
second → dark
```

---
