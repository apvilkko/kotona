const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const PORTS = require("../ports.json");

const common = require("./webpack.common.config");

const DIST = "distlite";

const config = {
  entry: "./src/uilite/index.js",
  output: {
    path: path.resolve(__dirname, DIST)
  },
  plugins: [new HtmlWebpackPlugin({ template: "./src/uilite/index.ejs" })]
};

const com = common("/lite", PORTS.uilite);

const conf = merge(com, config);

console.log(com, conf);

module.exports = conf;
