const noble = require("@abandonware/noble");

const listener = {
  context: {},
  setContext: (obj) => {
    listener.context = obj;
  },
  onDiscover: (p) => {
    const { isOk, deviceData } = listener.context;
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
        .replace(/^(\d{0,4})(03|05)/, "$2");
    }
  },
};

const initNoble = () =>
  new Promise((resolve, reject) => {
    if (!noble) {
      reject();
    } else {
      noble.once("stateChange", (state) => {
        if (state === "poweredOn") {
          noble.on("discover", listener.onDiscover);
          resolve();
        } else {
          console.error("Failed to init noble:", state);
          reject(state);
        }
      });
    }
  });

const isOurDevice = (macs) => (mac) =>
  macs.map((x) => x.addr.toUpperCase()).includes(mac.toUpperCase());

const readBluetooth = (config) =>
  new Promise(async (resolve, reject) => {
    const devices = config.devices;
    if (!devices || !devices.length) {
      reject([]);
      return;
    }

    const deviceData = {};

    for (let i = 0; i < devices.length; ++i) {
      expectedDevice = devices[i].addr.toUpperCase();
      deviceData[expectedDevice] = {
        entityId: expectedDevice,
        name: devices[i].name,
        data: [],
      };
    }

    listener.setContext({
      isOk: isOurDevice(devices),
      deviceData,
    });

    noble.startScanning([], true, (error) => {
      if (error) {
        console.error("noble scan error:", error);
        return;
      }
      setTimeout(() => {
        noble.stopScanning();
        const ret = [];
        Object.keys(deviceData).forEach((key) => {
          const data = deviceData[key];
          if (data && data.data && data.data.length > 1) {
            ret.push(data);
          }
        });
        console.log(`Read data from ${ret.length} BLE devices.`);
        resolve(ret);
      }, config.scanTime);
    });
  });

module.exports = {
  initNoble,
  readBluetooth,
};
