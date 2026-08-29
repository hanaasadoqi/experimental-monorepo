# @repo/ui-design-system

Framework-independent CSS tokens for the workspace. This package owns the
canonical color, typography, radius, and theme values; it does not configure
Tailwind, PostCSS, React, or application state.

## Usage

Import the public stylesheet from a composition root or framework adapter:

```css
@import "@repo/ui-design-system/index.css";
```

Most applications should import `@repo/ui-tailwind-config` instead, because the
Tailwind adapter already imports this stylesheet.

## Color contract

The `default`, `primary`, `secondary`, and `accent` primitive palettes expose
steps `50` through `950` in `:root`. Semantic roles use the collision-resistant
`--ds-color-*` namespace, including background, foreground, surface, primary,
secondary, muted, accent, destructive, border, input, and ring pairs.

Light values are the default. Both `.light` and `[data-theme="light"]` select
the explicit light theme; `.dark` and `[data-theme="dark"]` select the explicit
dark theme. When no explicit selector exists, the system color-scheme preference
provides the dark fallback.

## Runtime typography scaling

Set a unitless preference on the document root:

```typescript
document.documentElement.style.setProperty(
  "--font-size-scale-preference",
  String(scale)
)
```

The effective font-size scale is clamped between `0.75` and `2`, with `1` as the
default. Text sizes `xs` through `9xl` are computed from `--font-size-base` and
the effective scale. The root font size and unrelated `rem`-based geometry do
not change.

Line-height and letter-spacing use independent correction preferences:

- `--font-line-height-scale-preference`: clamped from `0.9` to `1.2`.
- `--font-letter-spacing-scale-preference`: clamped from `0` to `1.5`.

Their unitless and `em` values already follow the computed font size, so leave
both preferences at `1` unless a theme needs an optical correction.

## Radius contract

`--radius` is the canonical base radius. Derived `--ds-radius-sm` through
`--ds-radius-4xl` values are ordinary CSS variables mapped into Tailwind by the
adapter.

## Archived token tooling

The former TypeScript token objects, generator, conversion/normalization
utilities, HTML application helpers, and their tests are preserved locally at
`.archives/design-system/2026-08-29-token-tooling/`. Its `ARCHIVE.md` records the
original paths, archival revision, known stale tests, and restoration steps for
a future theme form or theme library.
