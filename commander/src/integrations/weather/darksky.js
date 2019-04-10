const fetch = require("node-fetch");

let url;
let config;

const transformEntity = data => ({ ...data, entityId: 1 });

const getEntities = () => {
  return new Promise((resolve, reject) =>
    fetch(url)
      .then(res => res.json())
      .then(res => resolve([transformEntity(res)]))
      .catch(reject)
  );
};

const pollingUpdate = (entity, onData) => {
  console.log("pollingUpdate", entity.entityId);
  getEntities().then(entities => {
    const data = entities[0];
    if (data) {
      onData(data);
    }
  });
};

const isObservable = () => false;

const api = { getEntities, isObservable, pollingUpdate };

const initialize = (conf, done) => {
  config = conf;
  const query = "?units=si&exclude=flags,alerts";
  url = `https://api.darksky.net/forecast/${config.apiKey}/${config.latitude},${
    config.longitude
  }${query}`;
  done(api);
};

module.exports = initialize;
