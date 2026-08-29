import { mergeConfig } from "vitest/config"

import { baseConfig } from "./base.js"

export const reactConfig = mergeConfig(baseConfig, {
  test: {
    environment: "jsdom",
  },
})
