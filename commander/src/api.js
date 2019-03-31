const dbFactory = require("./db");
const integrationsFactory = require("./integrations/index");
const express = require("express");
const bodyParser = require("body-parser");
const router = require("express-promise-router")();

const PORTS = require("../../ports");
const port = PORTS.commander;

const COMMANDS = "commands";
const DEVICES = "entities";
let integrations = {};
let db = null;

const startServer = () => {
  const app = express();
  app.use(bodyParser.json());

  router.get("/devices", async (req, res) => {
    const integration = "lights/tradfri";
    const dbDevices = db.getCollection(DEVICES);
    const devices = await integrations[integration].getDevices();
    const idMap = {};
    dbDevices.forEach(device => {
      idMap[device.deviceId] = device.id;
    });
    res.json(devices.map(x => ({ ...x, id: idMap[x.deviceId] })));
  });

  router.post("/devices/:id", async (req, res) => {
    const dbDevice = db.getEntity(DEVICES, req.params.id);
    const integration = "lights/tradfri";
    console.log("body", req.body);
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

dbFactory.initialize(dbInstance => {
  console.log("Database ready.");
  integrationsFactory.initialize(data => {
    integrations = data;
    console.log("Initialized integrations", Object.keys(integrations));
    Object.keys(integrations).forEach(key => {
      const integration = integrations[key];
      integration
        .getDevices()
        .then(devices => {
          dbInstance.syncDevices(key, devices);
        })
        .catch(console.error);
    });
    db = dbInstance;
    startServer();
  });
});
