const exec = require("child_process").exec;
const spawn = require("child_process").spawn;
const parseCoap = require("./parseCoap");
const constants = require("./constants");
const isDifferent = require("./isDifferent");

let config = {};

const MAX_TRIES = 3;

const {
  ATTR_SWITCH_PLUG,
  ATTR_LIGHT_CONTROL,
  LIGHT_CONTROL,
  PROPS,
  DEVICES
} = constants;

const getState = (entity, model, prop) => {
  const attr = model.includes("control")
    ? ATTR_SWITCH_PLUG
    : ATTR_LIGHT_CONTROL;
  if (entity[attr]) {
    const p = prop || LIGHT_CONTROL.state;
    const val = entity[attr][0][p];
    return p === LIGHT_CONTROL.state ? !!val : val;
  }
  return false;
};

const clamp = (val, newMax, max) => (val * newMax) / max;

const transformEntity = entity => {
  const model = getProp(entity, PROPS.model);
  return {
    name: getProp(entity, PROPS.name),
    model,
    entityId: getProp(entity, PROPS.id),
    subtype: getType(model),
    data: entity,
    on: getState(entity, model),
    brightness: clamp(getState(entity, model, LIGHT_CONTROL.dimmer), 100, 254),
    color: getState(entity, model, LIGHT_CONTROL.color)
  };
};

const streamProcessOutput = (command, args, callbacks) => {
  const child = spawn(`${command} ${args.join(" ")}`, [], { shell: true });
  child.stdout.on("data", callbacks.onData);
  child.stdout.on("end", callbacks.onData);
  child.stderr.on("data", callbacks.onError);
  child.on("close", callbacks.onClose);
  child.on("error", callbacks.onClose);
  return child;
};

const ONE_SHOT_RETRY_MS = 1000;

const execRequest = (command, resolve, reject, parse, tries) => {
  exec(command, { timeout: 4000 }, (err, stdout, stderr) => {
    if (!err) {
      let parsed = stdout;
      try {
        parsed = parse ? parseCoap(stdout)[0] : stdout;
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
        }, (tries + 1) * ONE_SHOT_RETRY_MS);
      }
    }
  });
};

const doRequest = (command, parse = false, delayMs) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      // console.log("exec: ", command);
      execRequest(command, resolve, reject, parse, 0);
    }, delayMs || 0);
  });

const getUri = (gatewayIp, entityId) => {
  const uri = `coaps://${gatewayIp}:5684/${DEVICES}`;
  if (entityId) {
    return `${uri}/${entityId}`;
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

const createParamList = (method, payload, observe) => {
  const ret = [
    "-m",
    method,
    "-u",
    `"${config.username}"`,
    "-k",
    `"${config.key}"`
  ];
  if (payload) {
    ret.push("-e");
    ret.push(`'${JSON.stringify(payload)}'`);
  }
  if (observe) {
    ret.push("-s");
    ret.push("1");
  }
  return ret;
};

const createParams = (method, payload, entityId, observe) => {
  const paramString = createParamList(method, payload, observe).join(" ");
  return `${paramString} "${getUri(config.gatewayIp, entityId)}"`;
};

const setEntityState = (entityId, parameter, value) => {
  let val = value;
  if (parameter === "dimmer") {
    val = Math.round((Number(value) / 100) * 254);
  }
  const params = createParams("put", createPayload(parameter, val), entityId);
  // console.log("setEntityState", entityId, parameter, val, params);
  return doRequest(`${config.coapClient} ${params}`);
};

const getEntityState = async (entity, parameter) => {
  if (parameter === "state") {
    return entity.on;
  }
  console.error(`getEntityState parameter ${parameter} not implemented!`);
  return undefined;
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

const getType = model => {
  if (model.includes("panel") || model.includes("bulb")) {
    return "light";
  }
  if (model.includes("outlet")) {
    return "outlet";
  }
  if (model.includes("sensor")) {
    return "sensor";
  }
  if (model.includes("control")) {
    return "switch";
  }
};

const getEntities = () => {
  const params = createParams("get");
  return new Promise((resolve, reject) => {
    doRequest(`${config.coapClient} ${params}`, true)
      .then(entityList => {
        const subRequests = entityList.map((entityId, i) => {
          const params = createParams("get", null, entityId);
          return doRequest(`${config.coapClient} ${params}`, true, 10 * i);
        });
        Promise.all(subRequests)
          .then(results => {
            resolve(results.map(transformEntity));
          })
          .catch(reject);
      })
      .catch(reject);
  });
};

const startObserving = (entityId, onData, onClose) => {
  const command = config.coapClient;
  const args = createParamList("get", null, true);
  args.push(`"${getUri(config.gatewayIp, entityId)}"`);
  return streamProcessOutput(command, args, {
    onData: buffer => {
      // console.log("onData", buffer);
      if (!buffer) return;
      const data = buffer.toString();
      const parsed = parseCoap(data);
      if (parsed.length) {
        onData(transformEntity(parsed[parsed.length - 1]));
      }
    },
    onError: data => {
      const str = data.toString();
      if ((str.length > 2 && str.startsWith("v:")) || str.length <= 2) {
        // ignore, this is normal data
      } else {
        console.error("observe", entityId, str);
      }
    },
    onClose
  });
};

const isObservable = entity => {
  return entity.subtype === "light" || entity.subtype === "outlet";
};

const api = {
  getEntities,
  getEntityState,
  setEntityState,
  startObserving,
  transformEntity,
  isObservable,
  isDifferent: (a, b) => {
    if (a && b) {
      if (a.data && b.data) {
        return isDifferent(a.data, b.data);
      }
    }
    return true;
  }
};

const initialize = (conf, done) => {
  config = conf;
  done(api);
};

module.exports = initialize;
