const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const PORTS = require("../ports.json");

const common = require("./webpack.common.config");

const DIST = "dist";

const config = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, DIST)
  },
  plugins: [new HtmlWebpackPlugin({ template: "./src/index.ejs" })]
};

module.exports = merge(common("/ui", PORTS.client), config);
