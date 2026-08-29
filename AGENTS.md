# Repository agent contract

## Start here

1. Read this file before changing the repository.
2. If `.docs/index.md` exists, read only the entries relevant to the task. The local docs tree is optional and may not exist on a fresh clone.
3. Inspect the owning package and its consumers before proposing a new abstraction or dependency.
4. For architectural changes, create or update a specification and implementation plan before editing production code.

## Ownership boundaries

- Applications are composition roots; packages never import from `apps`.
- Runtime direction is `shared` → `platform` and `ui` → `features` → `apps`.
- Feature-specific schemas, types, utilities, components, and hooks remain feature-owned until multiple legitimate owners justify extraction.
- `packages/tooling` and `packages/testing` are development-only support planes.
- `@workspace/design-system` is CSS-authoritative and independent of Tailwind and React.
- `@workspace/tailwind-config` is the one-way Tailwind adapter.
- shadcn-created code stays under `packages/ui/components/src/base`; project-owned UI stays under `src/components` and `src/hooks`.
- Cross-package imports use public package exports; do not bypass boundaries with deep filesystem imports.

Run `pnpm check:boundaries` after changing package manifests.

## Working rules

- Use strict TypeScript, semantic names, small focused modules, and composition.
- Preserve accessible HTML semantics, keyboard behavior, focus states, and reduced-motion preferences.
- Declare dependencies in the workspace that imports them; use `workspace:*` internally and `catalog:` for cataloged external packages.
- Do not create speculative shared, platform, or feature packages.
- Never put secrets, dependency trees, caches, or generated build output in `.docs` or `.archives`.

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
pnpm type-check
pnpm test:run
pnpm check:boundaries
pnpm build
```

Report exactly what ran and investigate failures rather than weakening tests or rules.
