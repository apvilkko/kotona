const fetch = require("node-fetch");

let url;
let config;

const transformEntity = data => ({ ...data, entityId: 1 });

const MAX_RETRIES = 3;

const fetchData = (resolve, reject, retries = 0) => {
  fetch(url)
    .then(res => res.json())
    .then(res => resolve([transformEntity(res)]))
    .catch(err => {
      if (retries < MAX_RETRIES) {
        const delay = 5000 * (retries + 1);
        console.log(`Retrying in ${delay} ms`);
        setTimeout(() => {
          fetchData(resolve, reject, retries + 1);
        }, delay);
      } else {
        reject(err);
      }
    });
};

const getEntities = () => {
  if (config.dummy) {
    return new Promise((resolve, reject) => {
      return resolve([
        transformEntity(
          require(`./forecast${Math.random() > 0.5 ? "" : "2"}.json`)
        )
      ]);
    });
  } else {
    return new Promise((resolve, reject) => fetchData(resolve, reject, 0));
  }
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
