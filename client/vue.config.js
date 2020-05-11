const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  transpileDependencies: ["vuetify"],

  // configureWebpack: {
  //   plugins: [new BundleAnalyzerPlugin()],
  // },

  devServer: {
    proxy: "http://localhost:5000",
  },
  productionSourceMap: false,
};
