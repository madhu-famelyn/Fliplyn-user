// craco.config.js

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 🔍 Find source-map-loader rule
      const sourceMapRule = webpackConfig.module.rules.find(
        (rule) => rule.enforce === "pre" && rule.use
      );

      if (sourceMapRule) {
        sourceMapRule.exclude = [
          ...(sourceMapRule.exclude || []),
          /node_modules\/@zxing/
        ];
      }

      return webpackConfig;
    },
  },
};