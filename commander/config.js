const secrets = require("./secrets.json");

module.exports = () => ({
  db: {
    adapter: "loki",
    path: "./data"
  },
  integrations: [
    {
      plugin: "lights/tradfri",
      enabled: true
    },
    {
      plugin: "weather/ruuvitag",
      enabled: true,
      dummy: false,
      polling: {
        all: true,
        default: 5 * 60 * 1000,
        quiet: 15 * 60 * 1000
      }
    },
    {
      plugin: "weather/darksky",
      enabled: true,
      dummy: false,
      readOnly: true,
      polling: {
        default: 10 * 60 * 1000,
        quiet: 60 * 60 * 1000
      }
    }
  ]
});
