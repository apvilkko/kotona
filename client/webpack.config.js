const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
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
  module: {
    rules: [
      {
        test: /\.svelte$/,
        // exclude: /node_modules/,
        use: {
          loader: "svelte-loader",
          options: {
            hotReload: true
          }
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/env"]
          }
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
  plugins: [new HtmlWebpackPlugin({ template: "./src/index.ejs" })]
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
