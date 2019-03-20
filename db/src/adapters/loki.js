const path = require("path");
const loki = require("lokijs");

let db;

const initLoki = (collections, done) => () => {
  collections.forEach(collection => {
    let entries = db.getCollection(collection);
    if (entries === null) {
      entries = db.addCollection(collection);
    }
  });
  done();
};

const initialize = (config, done) => {
  const initCallback = () => {
    done({
      session: db
    });
  };

  db = new loki(path.resolve(config.dbPath, "kotona.db"), {
    autoload: true,
    autoloadCallback: initLoki(config.collections, initCallback),
    autosave: true,
    autosaveInterval: 4000
  });
};

module.exports = initialize;
