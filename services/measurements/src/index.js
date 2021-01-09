const { readBluetooth, initNoble } = require("./bt");
const integrationKey = "weather/ruuvitag";
const secrets = require('../../../commander/secrets.json')[integrationKey]
const createConfig = require('../../../commander/config')
const { preprocess, getHumidity, getTemperature } = require('./ruuvitag')
const { init, saveEntity, saveMeasurement } = require('./db')

const config = createConfig().integrations.find(x => x.plugin === integrationKey)

const POLLING_INTERVAL_MS = 10*1000;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const decodeRuuviTagData = data => {
  const d = preprocess(data.data)
  return {
    ...data,
    temperature: getTemperature(d),
    humidity: getHumidity(d),
  }
}

init();

initNoble().then(async () => {
  while (true) {
    const data = await readBluetooth({...config, devices: secrets.devices});
    const decoded = data.map(decodeRuuviTagData);
    decoded.forEach(d => {
      saveEntity(d);
      saveMeasurement(d);
    })
    await sleep(/*config.polling.default*/ POLLING_INTERVAL_MS);
  }
}).catch(e => {
  console.error(e);
  process.exit(1);
})
