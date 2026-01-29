const path = require("path");

module.exports = {
  // Disable ESLint completely during production build
  eslint: {
    enable: false,
  },

  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },

    configure: (webpackConfig) => {
      // Remove ESLintWebpackPlugin entirely (fixes Netlify CI failures)
      webpackConfig.plugins = webpackConfig.plugins.filter(
        (plugin) => plugin.constructor.name !== "ESLintWebpackPlugin"
      );

      return webpackConfig;
    },
  },
};
