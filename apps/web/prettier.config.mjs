import baseConfig from '@foundation/tooling-prettier-config'

const webConfig = {
  ...baseConfig,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: '../../packages/ui/src/styles/globals.css',
  tailwindFunctions: ['cn', 'cva'],
};

export default webConfig;
