# @repo/ui-design-system

CSS-authoritative design system token definitions. This package provides the single source of truth for colors, spacing, typography, and shadows used across all UI components and applications.

## Purpose

- **Centralized tokens**: All design decisions live in one place
- **CSS-first**: Independent of Tailwind or React frameworks
- **Type-safe**: Exported TypeScript types for consumers
- **Single source of truth**: Eliminates duplication across components

## Token Categories

### Colors (`./colors`)
Semantic color tokens (primary, secondary, destructive) and their variations. Includes dark mode variants.

### Spacing (`./spacing`)
8px base unit spacing scale for padding, margins, gaps, and width fractions.

### Typography (`./typography`)
Font sizes with line heights, font weights, families, letter spacing, and line height utilities.

### Shadows (`./shadows`)
Elevation shadows for depth and emphasis (sm, md, lg, xl, 2xl).

## Usage

```typescript
// Import specific tokens
import { colors, spacing, typography, shadows } from "@repo/ui-design-system/tokens"

// Or import specific categories
import { colors } from "@repo/ui-design-system/colors"
import { spacing } from "@repo/ui-design-system/spacing"

// Use in code
const buttonStyles = {
  backgroundColor: colors.primary.DEFAULT,
  padding: spacing[4],
  fontSize: typography.fontSize.base,
}
```

## Consumers

- **@repo/tailwind-config**: Consumes tokens to generate Tailwind utilities
- **@repo/ui-components**: Uses tokens for component styling
- **Applications**: Direct access to tokens for custom styling

## Architecture

Design system tokens are intentionally separate from Tailwind configuration. This allows:
- Porting tokens to other frameworks (styled-components, emotion, etc.)
- Sharing token values with non-web platforms
- Independent evolution of design system vs. CSS framework
