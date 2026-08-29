# @workspace/test-mocks

Owns deterministic, runner-neutral browser substitutes and pure mock factories shared by Vitest and Storybook. Its source must not import Vitest globals, Storybook APIs, applications, or product-specific domain models.

Vitest and Storybook are development consumers; the package's own test files may use Vitest without making Vitest a runtime dependency.
