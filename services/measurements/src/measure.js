const { readBluetooth, initNoble } = require("./bt");
const integrationKey = "weather/ruuvitag";
const secrets = require("../../../commander/secrets.json")[integrationKey];
const createConfig = require("../../../commander/config");
const { preprocess, getHumidity, getTemperature } = require("./ruuvitag");
const { saveEntity, saveMeasurement } = require("./db");

const config = createConfig().integrations.find(
  (x) => x.plugin === integrationKey
);

const POLLING_INTERVAL_MS = config.polling.default || 10 * 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const decodeRuuviTagData = (data) => {
  const d = preprocess(data.data);
  return {
    ...data,
    temperature: getTemperature(d),
    humidity: getHumidity(d),
  };
};

const initMeasurements = initNoble;

const readMeasurements = () =>
  new Promise((resolve, reject) => {
    readBluetooth({ ...config, devices: secrets.devices })
      .then((data) => {
        const decoded = data.map(decodeRuuviTagData);
        decoded.forEach((d) => {
          saveEntity(d).then((id) => saveMeasurement(d, id));
        });
        sleep(POLLING_INTERVAL_MS).then(() => {
          resolve();
        });
      })
      .catch((err) => reject(err));
  });

module.exports = { initMeasurements, readMeasurements };
