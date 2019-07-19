const express = require("express");
const bodyParser = require("body-parser");
const router = require("express-promise-router")();
const kill = require("tree-kill");
const dbFactory = require("./db");
const integrationsFactory = require("./integrations/index");
const isQuietHours = require("./isQuietHours");

const PORTS = require("../../ports");
const port = PORTS.commander;

const METHOD_NOT_ALLOWED = 405;

const COMMANDS = "commands";
const ENTITIES = "entities";
let integrations = {};
let db = null;
const observed = {};
const socket = {};

const onDataCreator = dbInstance => entity => data => {
  // console.log("update", entity.id, entity.entityId, data);
  const updated = dbInstance.updateEntityData(entity.id, data);
  if (socket.ws && socket.ws.readyState !== 1) {
    console.log("update: ws not ready");
  } else if (socket.ws && updated) {
    console.log("update", entity.entityId);
    socket.ws.send(JSON.stringify(updated));
  }
};

// TODO refactor to integration
const startListeningEntity = (intKey, dbInstance, entity) => {
  const integration = integrations[intKey];
  if (integration.config.dummy && integration.config.dummyDb) {
    console.log("Dummy, skip listening");
    return;
  }
  const onData = onDataCreator(dbInstance)(entity);
  const onClose = code => {
    let delay = 1000 + Math.round(Math.random() * 5000);
    if (
      observed[intKey][entity.id] &&
      observed[intKey][entity.id].restartImmediately
    ) {
      delay = 100;
    }
    if (code === 0) {
      // process exited so probably some kind of problem
      delay = 60 * 1000;
    }
    console.log("close", code, intKey, delay);
    setTimeout(() => {
      // restart listening
      startListener();
    }, delay);
  };
  function startListener() {
    console.log("Start listening", entity.id, entity.entityId);
    observed[intKey][entity.id] = integrations[intKey].startObserving(
      entity.entityId,
      onData,
      onClose
    );
  }
  startListener();
};

const getRefreshDelay = (defaultDelay, quietDelay) => {
  const delay = isQuietHours()
    ? quietDelay || 15 * 60 * 1000
    : defaultDelay || 5 * 60 * 1000;
  const randomPart = Math.round(Math.random() * Math.min(30000, delay / 2));
  return delay + randomPart;
};

const INITIAL_LISTENING_DELAY = 500;

const startListening = (intKey, dbInstance, entities) => {
  const integration = integrations[intKey];
  if (integration.config.polling && integration.config.polling.all) {
    const updaters = {};
    entities.forEach(entity => {
      updaters[entity.entityId] = onDataCreator(dbInstance)(entity);
    });
    const doPollingUpdate = () => {
      integration.pollingUpdate(null, updaters);
      const nextDelay = getRefreshDelay(
        integration.config.polling.default,
        integration.config.polling.quiet
      );
      setTimeout(() => {
        doPollingUpdate();
      }, nextDelay);
    };
    setTimeout(doPollingUpdate, INITIAL_LISTENING_DELAY);
  } else {
    entities.forEach((entity, i) => {
      if (integration.isObservable(entity)) {
        setTimeout(() => {
          startListeningEntity(intKey, dbInstance, entity);
          setTimeout(() => {
            stopListening(intKey, entity.id);
          }, 10000 + Math.random() * 30000);
          const refreshByInterval = delay => {
            setTimeout(() => {
              console.log("interval refresh listener");
              stopListening(intKey, entity.id);
              refreshByInterval(getRefreshDelay());
            }, delay);
          };
          refreshByInterval(getRefreshDelay());
        }, i * INITIAL_LISTENING_DELAY);
      } else if (
        integration.config.polling &&
        !integration.config.polling.all
      ) {
        const onData = onDataCreator(dbInstance)(entity);
        const doPollingUpdate = () => {
          integration.pollingUpdate(entity, onData);
          const nextDelay = getRefreshDelay(
            integration.config.polling.default,
            integration.config.polling.quiet
          );
          setTimeout(() => {
            doPollingUpdate();
          }, nextDelay);
        };
        setTimeout(doPollingUpdate, INITIAL_LISTENING_DELAY);
      }
    });
  }
};

const stopListening = (intKey, dbId, restartImmediately) =>
  new Promise((resolve, reject) => {
    const child = observed[intKey][dbId];
    if (!child || !child.pid) {
      resolve();
      return;
    }
    kill(child.pid, "SIGINT", err => {
      observed[intKey][dbId] = { restartImmediately };
      console.log("killed", child.pid);
      resolve();
    });
  });

const sortBy = p => arr => {
  const sorted = [...arr];
  return sorted.sort(function(a, b) {
    return a[p] > b[p] ? 1 : a[p] < b[p] ? -1 : 0;
  });
};

const startServer = () => {
  const app = express();
  const expressWs = require("express-ws")(app);
  app.use(bodyParser.json());

  router.get("/entities", (req, res) => {
    const integration = req.query.type;
    let dbEntities;
    if (integration) {
      dbEntities = db.getCollection(ENTITIES, { integration });
    } else {
      dbEntities = db.getCollection(ENTITIES);
    }
    res.json(sortBy("name")(dbEntities));
  });

  router.post("/entities/:id", async (req, res) => {
    const dbEntity = db.getEntity(ENTITIES, req.params.id);
    if (!dbEntity) {
      res.sendStatus(400);
      return;
    }
    const intKey = req.body.integration;
    delete req.body.integration;
    const integration = integrations[intKey];
    if (!integration || integration.config.readOnly === false) {
      res.sendStatus(METHOD_NOT_ALLOWED);
    }
    await stopListening(intKey, dbEntity.id, true);
    if (req.body.id) {
      delete req.body.id;
    }
    const key = Object.keys(req.body)[0];
    const value = Object.values(req.body)[0];
    try {
      const result = await integrations[intKey].setEntityState(
        dbEntity.entityId,
        key,
        value
      );
      // console.log("setEntityState result", result);
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
    // TODO remove hardcode
    const intKey = "lights/tradfri";
    const { entity: entityId, parameter, value } = command;
    try {
      await integrations[intKey].setEntityState(entityId, parameter, value);
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

const doSync = (intKey, dbInstance, cb) => {
  // console.log("Starting sync for", intKey);
  let savedEntities = [];
  const integration = integrations[intKey];
  const useDummy = integration.config.dummy && integration.config.dummyDb;
  const dummyGetter = () =>
    new Promise((resolve, reject) => {
      console.log("using dummy getter for", intKey);
      resolve(dbInstance.getCollection(ENTITIES, { integration: intKey }));
    });
  const getter = useDummy ? dummyGetter : integration.getEntities;
  getter()
    .then(entities => {
      savedEntities = dbInstance.syncEntities(intKey, entities);
      cb(savedEntities);
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
    Object.keys(integrations).forEach(intKey => {
      observed[intKey] = {};
      doSync(intKey, dbInstance, entities => {
        setTimeout(() => {
          startListening(intKey, dbInstance, entities);
        }, 2000);
      });
    });
    db = dbInstance;
    startServer();
  });
});
