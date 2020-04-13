const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isProd = process.env.NODE_ENV === "production";
console.log("production", isProd);

const config = (publicPath, port, extractCss) => {
  const cssLoaders = ["css-loader", "sass-loader"];
  if (extractCss) {
    cssLoaders.unshift(MiniCssExtractPlugin.loader);
  } else {
    cssLoaders.unshift("style-loader");
  }
  const plugins = [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    //new BundleAnalyzerPlugin()
  ];
  if (extractCss) {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: "[name].[hash:8].css"
      })
    );
  }
  const conf = {
    mode: isProd ? "production" : "development",
    resolve: {
      alias: {
        svelte: path.resolve("node_modules", "svelte")
      },
      extensions: [".mjs", ".js", ".svelte"],
      mainFields: ["svelte", "browser", "module", "main"]
    },
    output: {
      filename: "[name].[hash:8].js",
      publicPath
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
          use: cssLoaders
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
    plugins
  };

  if (!isProd) {
    conf.devServer = {
      // contentBase: path.join(__dirname, "dist"),
      port,
      historyApiFallback: {
        index: `${publicPath}/index.html`
      }
      // hot: true
    };
    conf.devtool = "source-map";
  }
  return conf;
};

module.exports = config;
