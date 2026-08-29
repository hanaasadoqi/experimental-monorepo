import { mergeConfig } from "vitest/config"

import { baseConfig } from "@repo/foundation-vitest-config/base"

export default mergeConfig(baseConfig, {
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
})
