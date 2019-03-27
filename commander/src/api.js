const dbFactory = require("./db");
const integrationsFactory = require("./integrations/index");
const express = require("express");
const bodyParser = require("body-parser");

const PORTS = require("../../ports");
const port = PORTS.commander;

const COMMANDS = "commands";
let integrations = {};

const startServer = db => {
  const app = express();
  app.use(bodyParser.json());

  app.get("/commands", (req, res) => {
    res.json(db.getCollection(COMMANDS));
  });

  const saveCommand = (req, res) => {
    res.json(db.saveEntity(COMMANDS, req.body));
  };

  app.post("/commands", saveCommand);
  app.put("/commands/:id", saveCommand);
  app.delete("/commands/:id", (req, res) => {
    res.json(db.deleteEntity(COMMANDS, req.params.id));
  });

  app.post("/commands/:id/run", (req, res) => {
    const command = db.getEntity(COMMANDS, req.params.id);
    console.log("run", command);
    const integration = "lights/tradfri";
    const { device: deviceId, parameter, value } = command;
    integrations[integration].setDeviceState(deviceId, parameter, value);
    res.sendStatus(200);
  });

  console.log(`Starting commander on port`, port);
  app.listen(port);
};

dbFactory.initialize(dbInstance => {
  console.log("Database ready.");
  integrationsFactory.initialize(data => {
    integrations = data;
    console.log("Initialized integrations", Object.keys(integrations));
    startServer(dbInstance);
  });
});
