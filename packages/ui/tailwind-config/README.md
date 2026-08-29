# @repo/ui-tailwind-config

The one-way Tailwind CSS v4 adapter for `@repo/ui-design-system`. It owns the
Tailwind import, CSS-first theme mappings, dark variant, approved integrations,
base styles, and PostCSS configuration. Canonical design values remain in the
design-system package.

## Application composition

Import the adapter before the component alias layer in an application-owned
stylesheet:

```css
@import "@repo/ui-tailwind-config";
@import "@repo/ui-components/theme.css";

@source "../**/*.{ts,tsx}";
@source "../../../../packages/ui/components/src/**/*.{ts,tsx}";
```

Source registration belongs to the application because only the application
knows which reusable packages it composes. Do not add broad repository globs to
the shared adapter.

Use the exported PostCSS configuration from the application:

```javascript
export { default } from "@repo/ui-tailwind-config/postcss.config"
```

## Generated utilities

- Primitive palettes generate `default-*`, `primary-*`, `secondary-*`, and
  `accent-*` color utilities for steps `50` through `950`.
- Semantic utilities such as `bg-background`, `text-foreground`, and
  `border-border` map directly to `--ds-color-*` roles.
- Standard Tailwind `text-xs` through `text-9xl` utilities carry their mapped
  font size, line height, and letter spacing. There is no competing custom
  `@utility text-*` implementation.
- Font-family and radius utilities resolve to design-system variables.
- Chart and sidebar utilities resolve through the component-owned aliases from
  `@repo/ui-components/theme.css`.

The `dark:` variant matches `.dark`, descendants of `.dark`,
`[data-theme="dark"]`, and its descendants so it stays aligned with the
appearance runtime.
