# @workspace/vitest-utils

Owns behavior coupled to Vitest and Testing Library: matcher/setup registration and composable React render helpers. UI tests consume `/setup` and `/react` through explicit public subpaths.

It may consume runner-neutral test mocks when shared setup needs them, but must not depend on applications, features, Storybook, or the UI package it helps test.
