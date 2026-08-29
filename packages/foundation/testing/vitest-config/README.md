# @workspace/vitest-config

Owns reusable Vitest configuration variants. `base` covers environment-neutral tests; `react` adds jsdom and shared setup expectations for React component tests.

Consumers merge a variant in their own `vitest.config.ts`. This package owns configuration only—not render helpers, mocks, fixtures, or product-specific test behavior.
