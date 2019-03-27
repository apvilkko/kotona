const secrets = require("./secrets.json");

module.exports = () => ({
  dbAdapter: "loki",
  dbPath: "./data",
  integrations: [
    {
      plugin: "lights/tradfri",
      config: {
        gatewayIp: secrets["lights/tradfri"].gatewayIp,
        username: secrets["lights/tradfri"].username,
        key: secrets["lights/tradfri"].key
      }
    }
  ]
});
