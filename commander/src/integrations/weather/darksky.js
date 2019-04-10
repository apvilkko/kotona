const fetch = require("node-fetch");

let url;
let config;

const getEntities = () => {
  console.log("getEntities", url);
  return new Promise((resolve, reject) =>
    /* fetch(url)
      .then(res => res.json())
      .then(res => resolve([res]))
      .catch(reject) */
    {
      resolve([require("./forecast.json")]);
    }
  );
};

const pollingUpdate = (entity, onData) => {
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
  url = `http://headers.jsontest.com/${query}`;
  done(api);
};

module.exports = initialize;
