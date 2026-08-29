# @workspace/eslint-config

Owns reusable ESLint 10 flat-config fragments for base TypeScript, React, Next.js, and Storybook code. It is consumed only by the tracked root `eslint.config.mjs`; production packages must never import it at runtime.

Public API: the package root exports `baseConfig`, `reactConfig`, `nextConfig`, and `storybookConfig`. Add a rule here only when it is stable across every intended consumer; keep package- or app-specific overrides at the root composition point.
