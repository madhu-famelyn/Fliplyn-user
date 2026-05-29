// craco.config.js

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 🔍 Recursively find all rules and exclude node_modules from source-map-loader
      const traverseRules = (rules) => {
        if (!rules) return;
        rules.forEach((rule) => {
          if (rule.oneOf) {
            traverseRules(rule.oneOf);
          }
          if (rule.rules) {
            traverseRules(rule.rules);
          }
          
          // Check if this rule is using source-map-loader
          const isSourceMap = 
            (rule.loader && rule.loader.includes("source-map-loader")) ||
            (rule.use && (
              Array.isArray(rule.use)
                ? rule.use.some(u => (typeof u === "string" ? u.includes("source-map-loader") : (u.loader && u.loader.includes("source-map-loader"))))
                : (typeof rule.use === "string" ? rule.use.includes("source-map-loader") : (rule.use.loader && rule.use.loader.includes("source-map-loader")))
            ));

          if (isSourceMap) {
            rule.exclude = /node_modules/;
          }
        });
      };

      traverseRules(webpackConfig.module.rules);

      return webpackConfig;
    },
  },
};