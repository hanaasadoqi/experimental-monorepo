import { defineConfig } from "vitest/config"
import { baseConfig } from "@repo/foundation-vitest-config/base"

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/index.ts"],
    },
    setupFiles: ["./vitest.setup.ts"],
  },
})
