const createConfig = require("../config");

let db = null;

const initialize = done => {
  const config = createConfig();
  config.collections = require("./collections");
  const adapter = require(`./adapters/${config.dbAdapter}.js`)(
    config,
    instance => {
      db = instance;
      done(instance);
    }
  );
};

module.exports = {
  initialize
};
