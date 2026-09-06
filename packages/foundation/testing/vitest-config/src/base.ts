import { defineConfig } from "vitest/config"

export const baseConfig = defineConfig({
  test: {
    clearMocks: true,
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", ".archives/"],
    },
    mockReset: true,
    passWithNoTests: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {},
  },
})
