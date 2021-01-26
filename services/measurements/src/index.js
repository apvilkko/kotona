const { startServer } = require("./api");
const { init, getLatestTimestamp } = require("./db");
const { initMeasurements, readMeasurements } = require("./measure");

const db = init();

const startPolling = async () => {
  while (true) {
    await readMeasurements();
  }
};

const WATCHDOG_INTERVAL = 90 * 60 * 1000; // 1.5 hrs
const WATCHDOG_LIMIT = 120 * 60 * 1000; // 2 hrs

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const startWatchdog = async () => {
  // initial wait so that first read happens before watchdog check
  await sleep(30 * 1000);

  setInterval(async () => {
    const datetime = await getLatestTimestamp();
    if (datetime) {
      const delta = new Date().getTime() - datetime;
      if (delta > WATCHDOG_LIMIT) {
        console.log("watchdog exit", datetime, delta);
        process.exit(1);
      }
      console.log("watchdog ok");
    }
  }, WATCHDOG_INTERVAL);
};

initMeasurements()
  .then(() => {
    startServer(() => {
      startPolling();
      startWatchdog();
    });
  })
  .catch((e) => {
    console.error("initMeasurements catch", e);
    process.exit(1);
  });
