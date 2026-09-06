import { defineConfig } from "vitest/config"
import { baseConfig } from "@repo/foundation-vitest-config/base"

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["node_modules/", "dist/", ".archives/**"],
    },
    setupFiles: ["./vitest.setup.ts"],
  },
})
