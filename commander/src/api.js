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

const startListeningDevice = (integration, key, dbInstance, device) => {
  const onData = data => {
    dbInstance.updateDeviceData(device.id, data);
  };
  const onClose = code => {
    console.log("close code", code, key, device.deviceId);
    setTimeout(() => {
      // restart listening
      startListener();
    }, 10000);
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

const startListening = (integration, key, dbInstance, devices) => {
  devices.forEach(device =>
    startListeningDevice(integration, key, dbInstance, device)
  );
};

const stopListening = (integration, dbId) =>
  new Promise((resolve, reject) => {
    const child = observed[integration][dbId];
    if (!child) {
      resolve();
      return;
    }
    kill(child.pid, err => {
      observed[integration][dbId] = null;
      console.log("killed", child.pid);
      resolve();
    });
  });

const startServer = () => {
  const app = express();
  app.use(bodyParser.json());

  router.get("/devices", (req, res) => {
    const dbDevices = db.getCollection(DEVICES);
    res.json(dbDevices);
  });

  router.post("/devices/:id", async (req, res) => {
    const dbDevice = db.getEntity(DEVICES, req.params.id);
    const integration = "lights/tradfri";
    await stopListening(integration, dbDevice.id);
    try {
      await integrations[integration].setDeviceState(
        dbDevice.deviceId,
        Object.keys(req.body)[0],
        Object.values(req.body)[0]
      );
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
