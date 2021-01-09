const { readBluetooth, initNoble } = require("./bt");
const devices = require('../../../commander/secrets.json')['weather/ruuvitag'].devices

const POLLING_INTERVAL_MS = 10*1000;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

initNoble().then(async () => {
  while (true) {
    const data = await readBluetooth(devices);
    console.log(data)
    await sleep(POLLING_INTERVAL_MS);
  }
}).catch(e => {
  console.error(e);
  process.exit(1);
})
