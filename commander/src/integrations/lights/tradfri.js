const exec = require("child_process").exec;

const DEVICES = 15001;
const GROUPS = 15004;
const ATTR_SENSOR = 3300;
const ATTR_LIGHT_CONTROL = 3311;
const ATTR_SWITCH_PLUG = 3312;

const LIGHT_CONTROL = {
  color: 5706,
  colorHue: 5707,
  colorSaturation: 5708,
  colorX: 5709,
  colorY: 5710,
  transition: 5712,
  state: 5850,
  dimmer: 5851
};

const PROPS = {
  name: 9001,
  created: 9002,
  id: 9003,
  lastSeen: 9020,
  manufacturer: "3.0",
  model: "3.1",
  firmwareVersion: "3.3"
};

let config = {};

const MAX_TRIES = 3;

const parseResponse = str => {
  const splitLines = str.split("\n");
  let goodLine = 0;
  for (let i = 0; i < splitLines.length; ++i) {
    const line = splitLines[i];
    if (line.startsWith("[") || line.startsWith("{")) {
      goodLine = i;
      break;
    }
  }
  return JSON.parse(splitLines.filter((x, i) => i >= goodLine).join("\n"));
};

const execRequest = (command, resolve, reject, parse, tries) => {
  exec(command, { timeout: 4000 }, (err, stdout, stderr) => {
    if (!err) {
      let parsed = stdout;
      try {
        parsed = parse ? parseResponse(stdout) : stdout;
        resolve(parsed);
      } catch (e) {
        reject(e);
      }
    } else {
      if (tries >= MAX_TRIES) {
        reject(err ? err : stderr);
      } else {
        console.log("Retrying");
        setTimeout(() => {
          execRequest(command, resolve, reject, parse, tries + 1);
        }, 300);
      }
    }
  });
};

const doRequest = (command, parse = false, delayMs) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("exec: ", command);
      execRequest(command, resolve, reject, parse, 0);
    }, delayMs || 0);
  });

const getUri = (gatewayIp, deviceId) => {
  const uri = `coaps://${gatewayIp}:5684/${DEVICES}`;
  if (deviceId) {
    return `${uri}/${deviceId}`;
  }
  return uri;
};

const createPayload = (command, value) => {
  let val = value;
  if (command === "state") {
    if (val && value !== "off") {
      val = 1;
    } else {
      val = 0;
    }
  }
  return {
    [ATTR_LIGHT_CONTROL]: [
      {
        [LIGHT_CONTROL[command]]: val
      }
    ]
  };
};

const createParams = (method, payload, deviceId) =>
  `-m ${method} -u "${config.username}" -k "${config.key}" ${
    payload ? "-e '" + JSON.stringify(payload) + "'" : ""
  } "${getUri(config.gatewayIp, deviceId)}"`;

const setDeviceState = (deviceId, parameter, value) => {
  const params = createParams("put", createPayload(parameter, value), deviceId);
  console.log("setDeviceState", deviceId, parameter, value);
  return doRequest(`${config.coapClient} ${params}`);
};

const getProp = (obj, path) => {
  if (typeof path === "string") {
    const splitPath = path.split(".");
    if (splitPath.length > 1) {
      return obj[splitPath[0]][splitPath[1]];
    }
  }
  return obj[path];
};

const getType = device => {
  const model = getProp(device, PROPS.model);
  if (model.includes("panel") || model.includes("bulb")) {
    return "light";
  }
  if (model.includes("sensor")) {
    return "sensor";
  }
  if (model.includes("control")) {
    return "switch";
  }
};

const getState = device => {
  if (device[ATTR_LIGHT_CONTROL]) {
    return !!device[ATTR_LIGHT_CONTROL][0][LIGHT_CONTROL.state];
  }
  return false;
};

const transformDevice = device => ({
  name: getProp(device, PROPS.name),
  model: getProp(device, PROPS.model),
  deviceId: getProp(device, PROPS.id),
  subtype: getType(device),
  data: device,
  on: getState(device)
});

const getDevices = () => {
  const params = createParams("get");
  return new Promise((resolve, reject) => {
    doRequest(`${config.coapClient} ${params}`, true).then(deviceList => {
      const subRequests = deviceList.map((deviceId, i) => {
        const params = createParams("get", null, deviceId);
        return doRequest(`${config.coapClient} ${params}`, true, 10 * i);
      });
      Promise.all(subRequests)
        .then(results => {
          resolve(results.map(transformDevice));
        })
        .catch(reject);
    });
  });
};

const api = { getDevices, setDeviceState };

const initialize = (conf, done) => {
  config = conf;
  done(api);
};

module.exports = initialize;