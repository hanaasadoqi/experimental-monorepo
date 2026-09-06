# Repository agent contract

## Start here

1. Read this file before changing the repository.
2. If `.docs/index.md` exists, read only the entries relevant to the task. The local docs tree is optional and may not exist on a fresh clone.
3. Inspect the owning package and its consumers before proposing a new abstraction or dependency.
4. For architectural changes, create or update a specification and implementation plan before editing production code.

# Theme system instructions

Before proposing or making changes:

1. Read `.docs/handoffs/2026-09-02_handoff-theme-recovery/handoff.md`.
2. For theme, preferences, appearance, runtime, persistence, React integration, or adapters, also read `.docs/handoffs/2026-09-02_handoff-theme-recovery/theme-architecture.md`.
3. Inspect the current implementation and consumers before assuming the target architecture has already been implemented.
4. Distinguish whether Hanaa is exploring, deciding, experimenting, or requesting implementation.
5. Do not edit code when the request is only exploratory, diagnostic, or explanatory.
6. Surface material tradeoffs and caveats, then respect Hanaa’s decision.

Direct instructions from Hanaa override the documented reference architecture.

## Ownership boundaries

- Applications are composition roots; packages never import from `apps`.
- Runtime direction is `shared` → `services` and `domain` → `ui` → `runtime` → `features` → `apps`.
- Feature-specific schemas, types, utilities, components, and hooks remain feature-owned until multiple legitimate owners justify extraction.
- `packages/foundations` and `packages/foundations/testing` are development-only support planes.
- `@repo/design-system` is CSS-authoritative and independent of Tailwind and React.
- `@repo/tailwind-config` is the one-way Tailwind adapter.
- shadcn-created code stays under `packages/ui/components/src/base`; project-owned UI stays under `src/components` and `src/hooks`.
- Cross-package imports use public package exports; do not bypass boundaries with deep filesystem imports.

Run `pnpm check:boundaries` after changing package manifests.

## Working rules

- Use strict TypeScript, semantic names, small focused modules, and composition.
- Preserve accessible HTML semantics, keyboard behavior, focus states, and reduced-motion preferences.
- Declare dependencies in the repo that imports them; use `@repo/` packages when creating new packages.
- Do not create speculative shared, services, or feature packages.
- Never put secrets, dependency trees, caches, or generated build output in `.docs` or `.archives`.

## Deletion Policy

Never delete without asking, except:

- Generated files (dist/, .next/, node_modules/)
- Cache directories (.turbo/, coverage/)
- Files explicitly marked for removal in git

For everything else:

- Ask first if unsure
- Archive to .archives/ instead of deleting
- Preserve untracked files that might be in-progress work

## Preservation and documentation

- Prefer archiving code, files, folders, implementations over deleting them.
- Archive under `.archives/<category>/<date>-<slug>/` with an `ARCHIVE.md` manifest recording origin, reason, replacement, revision, and restoration steps.
- Git history remains the durable source of code history but `.history` also retains copies of local code changes; `.archives` is local and ignored.
- Put personal and agent-generated working material under `.docs`, update `.docs/index.md`, and mark superseded documents explicitly.
- Essential build, security, architecture, and contribution instructions must remain tracked outside `.docs`.

## Verification

Before claiming completion, run the checks that prove the affected behavior. For repository-wide changes use:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:run
pnpm check:boundaries
pnpm build
```

Report exactly what ran and investigate failures rather than weakening tests or rules.

## Architecture: Theme & Preferences Boundaries

See `.docs/architecture-boundaries.md` for the definitive rules on separating domain/runtime/ui/adapter layers.

**One rule:** Domain packages are pure (no React, no Next.js, no browser APIs). Each layer above adds one capability:

- Domain: Types & logic
- Runtime: React state & hooks
- UI: Components
- Adapters: Next.js specifics (`cookies()`, `headers()`)

When in doubt about where code belongs, consult that document first. It prevents the spaghetti we just cleaned up.
