const secrets = require("./secrets.json");

module.exports = () => ({
  dbAdapter: "loki",
  dbPath: "./data",
  integrations: [
    {
      plugin: "lights/tradfri",
      config: {
        ...secrets["lights/tradfri"]
      }
    }
  ]
});
