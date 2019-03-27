const Bundler = require("parcel-bundler");
const Path = require("path");
const PORTS = require("../ports.json");

// Single entrypoint file location:
const entryFiles = Path.join(__dirname, "./src/index.html");
// OR: Multiple files with globbing (can also be .js)
// const entryFiles = './src/*.js';
// OR: Multiple files in an array
// const entryFiles = ['./src/index.html', './some/other/directory/scripts.js'];

// Bundler options
const options = {
  publicUrl: "/ui"
};

(async function() {
  // Initializes a bundler using the entrypoint location and options provided
  const bundler = new Bundler(entryFiles, options);

  // Run the bundler, this returns the main bundle
  // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild
  const bundle = await bundler.serve(PORTS.client);
})();
