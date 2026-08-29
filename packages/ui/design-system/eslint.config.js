import { baseConfig } from "@repo/foundation-eslint-config/base"

export default [
  ...baseConfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    }
  }
]
