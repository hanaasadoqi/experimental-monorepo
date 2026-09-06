@AGENTS.md

# Claude-specific adapter

Use `AGENTS.md` as the canonical repository contract. When `.docs/index.md` exists, load only task-relevant local context and keep procedural workflows in skills rather than expanding this file. Record durable task artifacts in the appropriate `.docs` index without moving essential repository rules into ignored storage.

# Claude Code

Treat imported instructions as working guidance, not permission to override
Hanaa’s explicit decisions or prevent deliberate experimentation.

---

# Theme System Quick Reference

The theme system is organized in strict 4-layer architecture with verified boundary separation.

**Canonical reference**: `.docs/handoffs/2026-09-02_handoff-theme-recovery/theme-architecture.md`

## Layer ownership

| Layer | Package | Purpose | No access to |
|-------|---------|---------|--------------|
| **Domain** | `@repo/domain-theme` | Colors, tokens, compilation | React, browsers, Next.js |
| **Runtime** | `@repo/runtime-theme` | React state, appearance resolution | DOM, server-only APIs |
| **UI** | `@repo/ui-theme` | Components and controls | Domain internals |
| **Adapters** | `@repo/adapters-theme-*` | Browser/Next.js integration | Domain packages |

## Critical invariants

1. **Compilation pipeline**: `ThemeDefinition` → `compile()` → `CSSVariables` → DOM (via adapter)
2. **Appearance resolution**: Preference (`light|dark|system`) → `resolveAppearance()` → concrete `light|dark` → applied to DOM
3. **No circular dependencies**: Domain ← Runtime ← UI/Adapters (one-way only)
4. **Determinism**: `compile()` with same input always produces identical output (caching-safe)
5. **SSR safety**: No browser APIs in domain or runtime; adapters handle DOM/matchMedia

## Common tasks

See `.docs/guides/theme-system-developer-guide.md`:
- Add a new color to the theme
- Create a custom theme override
- Toggle appearance (light/dark/system)
- Debug theme application state

## Package exports (public API)

```typescript
// Domain: pure logic, no side effects
import { compile, deriveTheme, ThemeDefinition } from "@repo/domain-theme"

// Runtime: state + hooks
import { useThemeStore, useThemeScope, resolveAppearance } from "@repo/runtime-theme"
import { usePreferences } from "@repo/runtime-preferences"

// Adapters: browser/Next.js integration
import { applyAppearanceToDocument } from "@repo/adapters-theme-browser"
import { readThemeFromCookies } from "@repo/adapters-theme-next"
```

## Quick debugging

```bash
# Check TypeScript is clean
pnpm typecheck

# Verify boundary separation
pnpm check:boundaries

# Run theme integration tests
pnpm --filter @repo/runtime-theme test:run

# Manual smoke test: does dark mode actually change DOM?
pnpm dev
# Open browser console:
# getComputedStyle(document.documentElement).getPropertyValue("--color-primary")
```
