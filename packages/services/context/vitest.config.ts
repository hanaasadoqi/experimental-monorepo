import { mergeConfig } from "vitest/config"

import { baseConfig } from "@repo/foundation-vitest-config/base"

export default mergeConfig(baseConfig, {
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "@testing-library/react"],
    globals: {
      browser: true,
      node: false
    },
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"]
  },
})
