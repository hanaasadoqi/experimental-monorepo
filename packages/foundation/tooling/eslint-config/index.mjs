import js from "@eslint/js"
import prettierConfig from "eslint-config-prettier"
import globals from "globals"
import tseslint from "typescript-eslint"

export const GLOBAL_IGNORES = [
      "**/dist/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/node_modules/**",
      "**/.archives/**"
    ]
const sharedConfig = [
  js.configs.recommended,
  prettierConfig,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["error", "info", "warn"] }],
    },
  },
  {
    ignores: [
      ...GLOBAL_IGNORES,
    ],
  },
]

export const minimalConfig = sharedConfig

let turboPluginModule = null
let turboPluginError = null

try {
  turboPluginModule = await import("eslint-plugin-turbo")
} catch (e) {
  turboPluginError = e
}

export const baseConfig = turboPluginModule
  ? [
      ...sharedConfig.slice(0, -1),
      {
        plugins: {
          turbo: turboPluginModule.default,
        },
        rules: {
          "turbo/no-undeclared-env-vars": "warn",
        },
      },
      sharedConfig[sharedConfig.length - 1],
    ]
  : sharedConfig
