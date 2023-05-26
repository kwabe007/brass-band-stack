// remix.config.js
const { withEsbuildOverride } = require("remix-esbuild-override");
const { sassPlugin } = require("esbuild-sass-plugin");
const postcss = require("postcss");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");

/**
 * Define callbacks for the arguments of withEsbuildOverride.
 * @param option - Default configuration values defined by the remix compiler
 * @param isServer - True for server compilation, false for browser compilation
 * @param isDev - True during development.
 * @return {EsbuildOption} - You must return the updated option
 */
withEsbuildOverride((option, { isServer, isDev }) => {
  // update the option
  option.plugins = [...option.plugins, sassPlugin({
    async transform(source, resolveDir, filePath) {
      const { css: tailwindCss } = await postcss([tailwindcss]).process(source,  { from: filePath });
      const { css: autoprefixerCss } = await postcss([autoprefixer]).process(tailwindCss, { from: filePath });
      return autoprefixerCss;
    },
  })];

  return option;
});

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  future: {
    v2_errorBoundary: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
  ignoredRouteFiles: ["**/.*", "**/*.css", "**/*.test.{js,jsx,ts,tsx}"],
  tailwind: true,
};
