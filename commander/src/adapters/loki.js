const path = require("path");
const loki = require("lokijs");
const uuidv4 = require("uuid/v4");

let db;

const getCollection = collection => {
  return db.getCollection(collection).data;
};

const getEntity = (collection, id) => {
  return db.getCollection(collection).findOne({ id });
};

const saveEntity = (collection, entity) => {
  if (entity.id) {
    return db.getCollection(collection).update(entity);
  }
  return db.getCollection(collection).insert({ ...entity, id: uuidv4() });
};

const deleteEntity = (collection, id) => {
  if (id) {
    return db.getCollection(collection).findAndRemove({ id });
  }
};

const api = { getCollection, saveEntity, deleteEntity, getEntity };

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
      session: db,
      ...api
    });
  };

  db = new loki(path.resolve(config.dbPath, "kotona.db"), {
    autoload: true,
    autoloadCallback: initLoki(config.collections, initCallback),
    autosave: true,
    autosaveInterval: 10000
  });
};

module.exports = initialize;
