/**
 * `@repo/domain-theme` — pure theme domain.
 *
 * Layering: no React, no Next.js, no browser APIs, no state management.
 * See `.docs/architecture-boundaries.md`.
 *
 * One folder per concept. Each owns its own types and its own algorithms, and
 * each `index.ts` is that concept's public entry:
 *
 *   color/       what a color is, and the math over it
 *   appearance/  light vs dark, and resolving a preference into one
 *   density/     spacing presets for the shell and editor surfaces
 *   theme/       which colors constitute a theme, plus scope overrides
 *   compiler/    theme compilation contracts (types only — no implementation yet)
 *
 * Within a folder, `model.ts` holds the types and schemas; its siblings compute.
 * There is deliberately no top-level `model/` or `core/`: splitting by kind
 * rather than by concept is what produced the duplicate trees this replaced.
 */
export * from "./color"
export * from "./appearance"
export * from "./density"
export * from "./theme"
export * from "./compiler"
