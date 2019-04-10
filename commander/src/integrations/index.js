const createConfig = require("../../config");
const secrets = require("../../secrets.json");

const integrations = {};

const initialize = done => {
  const config = createConfig();

  const promises = config.integrations
    .filter(spec => spec.enabled !== false)
    .map(
      integrationSpec =>
        new Promise((resolve, reject) => {
          const intConfig = {
            ...integrationSpec,
            ...secrets[integrationSpec.plugin]
          };
          const fullConfig = {
            ...config,
            ...intConfig
          };
          require(`./${integrationSpec.plugin}.js`)(fullConfig, instance => {
            instance.config = intConfig;
            integrations[integrationSpec.plugin] = instance;
            resolve();
          });
        })
    );

  Promise.all(promises).then(() => {
    done(integrations);
  });
};

module.exports = {
  initialize
};
