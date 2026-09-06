import { baseConfig } from "@repo/foundation-vitest-config/base"
import { mergeConfig } from "vitest/config"

export default mergeConfig(baseConfig, {
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
})
