const isObservable = () => false;

let config;

const pollingUpdate = () => {};

const getEntities = () => {
  return new Promise((resolve) => resolve((config.devices || []).map(x => ({...x, entityId: x.addr}))));
};

const api = { getEntities, isObservable, pollingUpdate };

const initialize = (conf, done) => {
  config = conf;
  done(api);
};

module.exports = initialize;