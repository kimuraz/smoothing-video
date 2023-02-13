const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "/",
  configureWebpack: {
    module: {
      rules: [
        {
          // xml
          test: /\.xml$/,
          use: ["raw-loader"],
        },
      ],
    },
    resolve: {
      fallback: {
        path: require.resolve("path-browserify"),
        fs: require.resolve("fs-browsers"),
      },
    },
  },
});
