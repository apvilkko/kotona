const { startServer } = require("./api");
const { init } = require("./db");
const { initMeasurements, readMeasurements } = require("./measure");

const db = init();

const startPolling = async () => {
  while (true) {
    await readMeasurements();
  }
};

initMeasurements()
  .then(() => {
    startServer(() => {
      startPolling();
    });
  })
  .catch((e) => {
    console.error("initMeasurements catch", e);
    process.exit(1);
  });
