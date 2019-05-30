const os = require("os");
const pty = require("node-pty");
const stripAnsi = require("strip-ansi");
const shell = "bash";

const integration = "weather/ruuvitag";

let config;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const isOurDevice = macs => mac =>
  macs.map(x => x.addr.toUpperCase()).includes(mac.toUpperCase());

const readBluetoothctl = devices =>
  new Promise(async (resolve, reject) => {
    if (!devices || !devices.length) {
      reject([]);
      return;
    }
    const term = pty.spawn(shell, [], {
      name: "xterm-color",
      cols: 80,
      rows: 40,
      cwd: process.env.HOME,
      env: process.env
    });

    let expectedDevice = null;
    let currentDevice = null;
    const deviceData = {};
    const isOk = isOurDevice(devices);

    term.on("data", function(data) {
      const stripped = stripAnsi(data);
      const lines = stripped.split("\n").map(x => x.trim());
      lines.forEach(line => {
        if (line.startsWith(`Device ${expectedDevice}`)) {
          currentDevice = expectedDevice;
        }
        if (
          currentDevice &&
          line.startsWith("ManufacturerData Value") &&
          isOk(currentDevice)
        ) {
          deviceData[currentDevice].data.push(line.substr(line.length - 4, 4));
        }
      });
    });

    term.write(" bluetoothctl\r");
    await sleep(300);
    term.write("power on\r");
    await sleep(2000);
    term.write("scan on\r");
    await sleep(2000);

    for (let i = 0; i < devices.length; ++i) {
      expectedDevice = devices[i].addr.toUpperCase();
      deviceData[expectedDevice] = {
        entityId: expectedDevice,
        integration,
        name: devices[i].name,
        data: []
      };
      term.write(`info ${expectedDevice}\r`);
      await sleep(1000);
    }

    term.write("scan off\r");
    await sleep(1000);

    term.write("exit\r");
    await sleep(300);
    term.write(" exit\r");
    await sleep(1000);
    term.kill();

    const ret = [];
    Object.keys(deviceData).forEach(key => {
      const data = deviceData[key];
      if (data && data.data && data.data.length > 1) {
        ret.push(data);
      }
    });
    resolve(ret);
  });

const getEntities = () => {
  if (config.dummy) {
    return new Promise((resolve, reject) => {
      return resolve(require("./ruuvitag.json"));
    });
  } else {
    return readBluetoothctl(config.devices);
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
  done(api);
};

module.exports = initialize;
