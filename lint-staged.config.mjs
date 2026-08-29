/** @type {import("lint-staged").Configuration} */
const config = {
  "*.{js,cjs,mjs,jsx,ts,tsx,json,jsonc,css,scss,md,mdx,yaml,yml,html}":
    "prettier --write --ignore-unknown --ignore-path=.prettierignore",
};

export default config;
