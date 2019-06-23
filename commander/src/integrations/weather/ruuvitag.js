let noble;

const integration = "weather/ruuvitag";

let config;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const isOurDevice = macs => mac =>
  macs.map(x => x.addr.toUpperCase()).includes(mac.toUpperCase());

const initNoble = () =>
  new Promise((resolve, reject) => {
    if (!noble) {
      reject();
    } else {
      noble.once("stateChange", state => {
        if (state === "poweredOn") {
          resolve();
        } else {
          console.error("Failed to init noble:", state);
          reject(state);
        }
      });
    }
  });

const readBluetooth = devices =>
  new Promise(async (resolve, reject) => {
    if (!devices || !devices.length) {
      reject([]);
      return;
    }

    const deviceData = {};
    const isOk = isOurDevice(devices);

    for (let i = 0; i < devices.length; ++i) {
      expectedDevice = devices[i].addr.toUpperCase();
      deviceData[expectedDevice] = {
        entityId: expectedDevice,
        integration,
        name: devices[i].name,
        data: []
      };
    }

    noble.startScanning([], true, error => {
      if (error) {
        console.error("noble scan error:", error);
        return;
      }
      setTimeout(() => {
        noble.stopScanning();
        const ret = [];
        Object.keys(deviceData).forEach(key => {
          const data = deviceData[key];
          if (data && data.data && data.data.length > 1) {
            ret.push(data);
          }
        });
        console.log(`Read data from ${ret.length} ruuvitag devices.`);
        resolve(ret);
      }, 5000);
    });

    noble.on("discover", p => {
      if (
        isOk(p.address) &&
        p.advertisement &&
        p.advertisement.manufacturerData
      ) {
        // Remove preamble from data
        deviceData[
          p.address.toUpperCase()
        ].data = p.advertisement.manufacturerData
          .toString("hex")
          .replace(/^(\d{0,4})(03)/, "$2");
      }
    });
  });

const getEntities = () => {
  if (config.dummy) {
    return new Promise((resolve, reject) => {
      return resolve(require("./ruuvitag.json"));
    });
  } else {
    return readBluetooth(config.devices);
  }
};

const pollingUpdate = (entity, onData) => {
  console.log("pollingUpdate");
  getEntities().then(entities => {
    entities.forEach(entity => {
      if (entity) {
        onData[entity.entityId](entity);
      }
    });
  });
};

const isObservable = () => false;

const api = { getEntities, isObservable, pollingUpdate };

const initialize = (conf, done) => {
  config = conf;
  if (!config.dummy) {
    noble = require("@abandonware/noble");
    initNoble()
      .then(() => {
        done(api);
      })
      .catch(() => {
        done(api);
      });
  } else {
    done(api);
  }
};

module.exports = initialize;
