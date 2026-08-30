import storybook from "eslint-plugin-storybook"
import { baseConfig } from "./index.mjs"

export const storybookConfig = [
  ...baseConfig,
  ...storybook.configs["flat/recommended"],
]
