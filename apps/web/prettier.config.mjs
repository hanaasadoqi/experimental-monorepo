import baseConfig from '@foundation/tooling-prettier-config'

const webConfig = {
  ...baseConfig,
  tailwindStylesheet: '../../packages/ui/src/styles/globals.css',
};

export default webConfig;
