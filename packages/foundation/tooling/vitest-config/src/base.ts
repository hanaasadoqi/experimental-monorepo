import { defineConfig } from 'vitest/config'

export const baseConfig = defineConfig({
  test: {
    clearMocks: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    mockReset: true,
    passWithNoTests: true,
    restoreMocks: true,
  },
})
