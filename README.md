# Synapcity monorepo

A modular workspace for long-lived theme, preference, and color systems. Organized by architectural layers: domain (pure logic), features (React state), services (utilities), adapters (integrations), UI (components), and applications (composition roots).

## Structure

- `packages/domain/theme` — Pure color and appearance models
- `packages/features/preferences` — Active in-memory preference state
- `packages/services/zustand` — Shared state management utilities
- `packages/adapters/theme-*` — Environment-specific adapters (browser, Next.js)
- `packages/ui/theme` — Theme editing and visualization components
- `apps/web` — Next.js application (composition root)

## Development

```bash
pnpm install
pnpm dev          # Start dev server
pnpm test:run     # Run all tests
pnpm lint         # Type check and lint
pnpm format       # Format all files
pnpm check:boundaries  # Verify package ownership
```
