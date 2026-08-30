import { baseConfig } from "@repo/foundation-vitest-config/base";
import { defineConfig } from "vitest/config";


const config = defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    setupFiles: ["./vitest.setup.ts"],
  },
})

export default config;
