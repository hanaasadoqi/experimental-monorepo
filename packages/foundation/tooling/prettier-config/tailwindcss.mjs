import baseConfig from "./index.mjs"

/** @type {import('prettier').Config} */
export default {
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), "prettier-plugin-tailwindcss"],
  tailwindFunctions: ["cn", "cva"],
}
