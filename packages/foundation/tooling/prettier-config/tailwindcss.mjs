import baseConfig from './index.mjs';

/** @type {import('prettier').Config} */
export default {
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), 'prettier-plugin-tailwindcss'],
  tailwindStylesheet: 'packages/ui/src/styles/globals.css',
  tailwindFunctions: ['cn', 'cva'],
}
