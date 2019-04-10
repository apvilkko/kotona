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
      plugin: "weather/darksky",
      readOnly: true,
      polling: {
        default: 10 * 60 * 1000,
        quiet: 60 * 60 * 1000
      }
    }
  ]
});
