const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const PORTS = require("../ports.json");

const isProd = process.env.NODE_ENV === "production";
console.log("production", isProd);

const config = {
  mode: isProd ? "production" : "development",
  entry: "./src/index.js",
  resolve: {
    alias: {
      svelte: path.resolve("node_modules", "svelte")
    },
    extensions: [".mjs", ".js", ".svelte"],
    mainFields: ["svelte", "browser", "module", "main"]
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[hash:8].js",
    publicPath: "/ui"
  },
  optimization: {
    minimize: isProd,
    //minimize: false,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 5,
          warnings: false,
          parse: {},
          mangle: true,
          module: false,
          toplevel: false,
          nameCache: null,
          ie8: true,
          keep_classnames: undefined,
          keep_fnames: false,
          safari10: true,
          compress: {
            arrows: false
          },
          output: {
            webkit: true
          }
        }
      })
    ]
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: [
          "babel-loader",
          {
            loader: "svelte-loader",
            options: {
              hotReload: true
            }
          }
        ]
      },
      {
        test: /\.(js|mjs)$/,
        include: [path.resolve("./src"), /svelte/, /url-params-parser/],
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.scss$/i,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.svg/,
        use: {
          loader: "svg-inline-loader",
          options: {}
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./src/index.ejs" }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    //new BundleAnalyzerPlugin()
  ]
};

if (!isProd) {
  config.devServer = {
    // contentBase: path.join(__dirname, "dist"),
    port: PORTS.client,
    historyApiFallback: {
      index: "/ui/index.html"
    }
    // hot: true
  };
  config.devtool = "source-map";
}

module.exports = config;
