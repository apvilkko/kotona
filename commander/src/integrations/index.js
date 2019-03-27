const createConfig = require("../../config");

const integrations = {};

const initialize = done => {
  const config = createConfig();

  const promises = config.integrations.map(
    integrationSpec =>
      new Promise((resolve, reject) => {
        require(`./${integrationSpec.plugin}.js`)(
          Object.assign({}, config, integrationSpec.config),
          instance => {
            integrations[integrationSpec.plugin] = instance;
            resolve();
          }
        );
      })
  );

  Promise.all(promises).then(() => {
    done(integrations);
  });
};

module.exports = {
  initialize
};
