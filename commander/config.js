const secrets = require("./secrets.json");

module.exports = () => ({
  db: {
    adapter: "loki",
    path: "./data",
  },
  polling: {
    default: 1 * 60 * 1000,
    quiet: 5 * 60 * 1000,
  },
  integrations: [
    {
      plugin: "lights/tradfri",
      enabled: true,
      dummy: true,
      dummyDb: true,
    },
    {
      plugin: "weather/ruuvitag",
      enabled: false,
      dummy: true,
      autoClean: false,
      scanTime: 6500,
      polling: {
        all: true,
        default: 5 * 60 * 1000,
        quiet: 15 * 60 * 1000,
      },
    },
    {
      plugin: "weather/openweathermap",
      enabled: true,
      dummy: true,
      readOnly: true,
      polling: {
        default: 15 * 60 * 1000,
        quiet: 60 * 60 * 1000,
      },
    },
    {
      plugin: "security/camera",
      enabled: true,
      readOnly: true,
      autoClean: true,
    },
  ],
});
