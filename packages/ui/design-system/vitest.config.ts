import { mergeConfig } from "vitest/config"

import { baseConfig } from "@repo/foundation-vitest-config/base"

export default mergeConfig(baseConfig, {
  test: {
    include: ["src/**/*.test.ts"],
    globals: true,
    environment: "jsdom",
  },
})
