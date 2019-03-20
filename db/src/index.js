const createConfig = require("../config");

const initialize = done => {
  const config = createConfig();
  config.collections = require("./collections");
  const adapter = require(`./adapters/${config.adapter}.js`)(config, done);
};

module.exports = {
  initialize
};

initialize(db => {
  console.log("init done", db);
  db.session.getCollection("entities").insert({ id: 1 });
  db.session.close();
});
