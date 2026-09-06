import { mergeConfig } from "vitest/config"

import { baseConfig } from "@repo/foundation-vitest-config/base"

export default mergeConfig(baseConfig, {
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "tests/**/*.test.mjs"],
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.js"],
  },
})
