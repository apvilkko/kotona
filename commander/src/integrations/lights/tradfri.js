const TYPE_DEVICE = 15001;
const COMMANDS = {
  state: 5850,
  dimmer: 5851,
  color: 5706,
  colorX: 5709,
  colorY: 5710,
  transition: 5712
};

let config = {};

const getUri = (gatewayIp, deviceId) => {
  const uri = `coaps://${gatewayIp}:5684/${TYPE_DEVICE}`;
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
    3311: [
      {
        [COMMANDS[command]]: val
      }
    ]
  };
};

const createParams = (method, payload, deviceId) =>
  `-m ${method} -u "${config.username}" -k "${config.key}" -e '${JSON.stringify(
    payload
  )}' "${getUri(config.gatewayIp, deviceId)}"`;

const setDeviceState = (deviceId, parameter, value) => {
  const params = createParams("put", createPayload(parameter, value), deviceId);
  console.log("setDeviceState", deviceId, parameter, value, params);
};

const api = { setDeviceState };

const initialize = (conf, done) => {
  config = conf;
  done(api);
};

module.exports = initialize;
