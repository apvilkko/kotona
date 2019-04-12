const path = require("path");
const loki = require("lokijs");
const uuidv4 = require("uuid/v4");

let db;

const getCollection = (collection, query) => {
  if (!query) {
    return db.getCollection(collection).data;
  }
  return db.getCollection(collection).find(query);
};

const getEntity = (collection, id) => {
  return db.getCollection(collection).findOne({ id });
};

const saveEntity = (collection, entity, insert = false) => {
  if (insert) {
    return db.getCollection(collection).insert(entity);
  }
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

const updateEntityData = (id, entity) => {
  const collection = "entities";
  // console.log("update", entity);
  const existing = db.getCollection(collection).findOne({ id });
  if (existing) {
    const newData = {
      ...existing,
      ...entity
    };
    saveEntity(collection, newData);
    return newData;
  }
  return null;
};

const syncEntities = (intKey, entities) => {
  const collection = "entities";
  entities.forEach(entity => {
    const existing = db
      .getCollection(collection)
      .findOne({ entityId: entity.entityId, integration: intKey });
    if (existing) {
      console.log("found existing", entity.entityId, intKey);
      saveEntity(collection, {
        ...existing,
        name: entity.name,
        data: entity.data
      });
    } else {
      console.log("saving new", entity.entityId, intKey);
      saveEntity(collection, {
        ...entity,
        type: "entity",
        integration: intKey
      });
    }
  });
  console.log(`Synced ${entities.length} entities.`);
  return db.getCollection(collection).find({ integration: intKey });
};

const api = {
  getCollection,
  saveEntity,
  deleteEntity,
  getEntity,
  syncEntities,
  updateEntityData
};

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

  db = new loki(path.resolve(config.db.path, "kotona.db"), {
    autoload: true,
    autoloadCallback: initLoki(config.collections, initCallback),
    autosave: true,
    autosaveInterval: 10000
  });
};

module.exports = initialize;
