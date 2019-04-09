const express = require("express");
const bodyParser = require("body-parser");
const router = require("express-promise-router")();
const kill = require("tree-kill");
const dbFactory = require("./db");
const integrationsFactory = require("./integrations/index");

const PORTS = require("../../ports");
const port = PORTS.commander;

const COMMANDS = "commands";
const DEVICES = "entities";
let integrations = {};
let db = null;
const observed = {};
const socket = {};

const startListeningDevice = (integration, key, dbInstance, device) => {
  const onData = data => {
    // console.log("update", device.id, device.deviceId, data);
    const updated = dbInstance.updateDeviceData(device.id, data);
    if (socket.ws && updated) {
      console.log("update", device.id, device.deviceId);
      socket.ws.send(JSON.stringify(updated));
    }
  };
  const onClose = code => {
    let delay = 1000 + Math.round(Math.random() * 5000);
    if (
      observed[key][device.id] &&
      observed[key][device.id].restartImmediately
    ) {
      delay = 100;
    }
    if (code === 0) {
      // process exited so probably some kind of problem
      delay = 10 * 60 * 1000;
    }
    console.log("close", code, key, delay);
    setTimeout(() => {
      // restart listening
      startListener();
    }, delay);
  };
  function startListener() {
    console.log("Start listening", device.id, device.deviceId);
    observed[key][device.id] = integration.startObserving(
      device.deviceId,
      onData,
      onClose
    );
  }
  startListener();
};

const getRefreshDelay = date => {
  const hour = (date || new Date()).getHours();
  // TODO "quiet hours" in config
  const randomPart = Math.round(Math.random() * 30000);
  return hour >= 23 && hour < 6
    ? 15 * 60 * 1000 + randomPart
    : 5 * 60 * 1000 + randomPart;
};

// TODO move logic to integration
const shouldListen = device => {
  return device.subtype === "light" || device.subtype === "outlet";
};

const startListening = (integration, key, dbInstance, devices) => {
  devices.forEach((device, i) => {
    if (shouldListen(device)) {
      setTimeout(() => {
        startListeningDevice(integration, key, dbInstance, device);
        setTimeout(() => {
          stopListening(key, device.id);
        }, 10000 + Math.random() * 30000);
        const refreshByInterval = delay => {
          setTimeout(() => {
            console.log("interval refresh listener");
            stopListening(key, device.id);
            refreshByInterval(getRefreshDelay());
          }, delay);
        };
        refreshByInterval(getRefreshDelay());
      }, i * 500);
    }
  });
};

const stopListening = (integration, dbId, restartImmediately) =>
  new Promise((resolve, reject) => {
    const child = observed[integration][dbId];
    if (!child || !child.pid) {
      resolve();
      return;
    }
    kill(child.pid, "SIGINT", err => {
      observed[integration][dbId] = { restartImmediately };
      console.log("killed", child.pid);
      resolve();
    });
  });

const startServer = () => {
  const app = express();
  const expressWs = require("express-ws")(app);
  app.use(bodyParser.json());

  router.get("/devices", (req, res) => {
    const dbDevices = db.getCollection(DEVICES);
    res.json(dbDevices);
  });

  router.post("/devices/:id", async (req, res) => {
    const dbDevice = db.getEntity(DEVICES, req.params.id);
    if (!dbDevice) {
      res.sendStatus(400);
      return;
    }
    const integration = "lights/tradfri";
    await stopListening(integration, dbDevice.id, true);
    if (req.body.id) {
      delete req.body.id;
    }
    const key = Object.keys(req.body)[0];
    const value = Object.values(req.body)[0];
    try {
      const result = await integrations[integration].setDeviceState(
        dbDevice.deviceId,
        key,
        value
      );
      // console.log("setDeviceState result", result);
      res.sendStatus(200);
    } catch (e) {
      console.error(e);
      res.sendStatus(400);
    }
  });

  router.get("/commands", (req, res) => {
    res.json(db.getCollection(COMMANDS));
  });

  const saveCommand = (req, res) => {
    res.json(db.saveEntity(COMMANDS, req.body));
  };

  router.post("/commands", saveCommand);
  router.put("/commands/:id", saveCommand);
  router.delete("/commands/:id", (req, res) => {
    res.json(db.deleteEntity(COMMANDS, req.params.id));
  });

  router.post("/commands/:id/run", async (req, res) => {
    const command = db.getEntity(COMMANDS, req.params.id);
    console.log("run", command);
    const integration = "lights/tradfri";
    const { device: deviceId, parameter, value } = command;
    try {
      await integrations[integration].setDeviceState(
        deviceId,
        parameter,
        value
      );
      res.sendStatus(200);
    } catch (e) {
      console.error(e);
      res.sendStatus(400);
    }
  });

  router.ws("/update", (ws, req) => {
    socket.ws = ws;
    ws.on("message", msg => {
      console.log("ws message");
      ws.send(msg);
    });
    ws.on("error", msg => {
      console.log("ws error", msg);
      ws.close();
    });
  });

  app.use(router);
  console.log(`Starting commander on port`, port);
  app.listen(port);
};

const doSync = (integration, key, dbInstance, cb) => {
  // console.log("Starting sync for", key);
  let savedDevices = [];
  integration
    .getDevices()
    .then(devices => {
      savedDevices = dbInstance.syncDevices(key, devices);
      cb(savedDevices);
    })
    .catch(e => {
      console.error("doSync error:", e);
      cb([]);
    });
};

dbFactory.initialize(dbInstance => {
  console.log("Database ready.");
  integrationsFactory.initialize(data => {
    integrations = data;
    console.log("Initialized integrations", Object.keys(integrations));
    Object.keys(integrations).forEach(key => {
      observed[key] = {};
      const integration = integrations[key];
      doSync(integration, key, dbInstance, devices => {
        setTimeout(() => {
          startListening(integration, key, dbInstance, devices);
        }, 2000);
      });
    });
    db = dbInstance;
    startServer();
  });
});
