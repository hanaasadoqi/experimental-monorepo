import { mergeConfig } from "vitest/config"

import { baseConfig } from "@repo/foundation-vitest-config/base"

export default mergeConfig(baseConfig, {
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["vitest.setup.ts"],
  }
})
