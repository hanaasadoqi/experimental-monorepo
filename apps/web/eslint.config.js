import { nextJsConfig } from "@repo/foundation-eslint-config/next-js"

const webConfig = [
  ...nextJsConfig,
  {
    ignores: ["src/components/quarantine/**"],
  },
  // Block faker imports in app code (dev-only, should never reach production)
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@repo/foundation-test-mocks/faker",
                "@repo/foundation-test-mocks/seeds",
                "@faker-js/faker",
              ],
              message:
                "❌ Faker and seeds can only be used in tests, scripts, or dev-only files. Not in app code.",
            },
          ],
        },
      ],
    },
  },
  // Allow faker in tests and scripts
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/scripts/**/*.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
]

export default webConfig
