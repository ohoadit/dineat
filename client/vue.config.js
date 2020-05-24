const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  transpileDependencies: ["vuetify"],

  // chainWebpack: (config) => {
  //   // config.optimization.splitChunks({
  //   //   chunks: "all",
  //   //   // cacheGroups: {
  //   //   //   commons: {
  //   //   //     test: /[\\/]node_modules[\\/]/,
  //   //   //     name: "vendor",
  //   //   //   },
  //   //   // },
  //   // });
  //   config.plugin("preload").tap((options) => {
  //     options[0].fileWhitelist = [/\.css$/];
  //     return options;
  //   });
  //   config.plugins.delete("prefetch");
  // },
  // config.plugin("mini-css-extract-plugin");
  // },
  // configureWebpack: {
  //   // plugins: [new BundleAnalyzerPlugin()],
  // },

  devServer: {
    proxy: "http://localhost:5000",
  },
  productionSourceMap: false,
};
