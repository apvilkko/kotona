const createConfig = require("../config");
const toSeconds = require("./toSeconds");
const isQuietHours = require("./isQuietHours");

const config = createConfig();
let db;
let actions;
let startTime;

const init = (dbRef, actionsRef) => {
  db = dbRef;
  actions = actionsRef;
};

// Don't run triggers during app start
const STARTUP_TRIGGER_SAFEGUARD = 1 * 60 * 1000;

const COMMANDS = "commands";
const ENTITIES = "entities";

const toBool = x => x === "on" || x === 1 || x === true || x === "true";

const getLastModified = intKey => {
  const entities = db.getCollection(ENTITIES, { integration: intKey });
  let latest = 0;
  entities.forEach(entity => {
    if (entity.lastModified) {
      Object.values(entity.lastModified).forEach(timestamp => {
        if (timestamp > latest) {
          latest = timestamp;
        }
      });
    }
  });
  return latest;
};

const bookKeeping = {};

const getInterval = upperLimit =>
  (upperLimit ? 1.5 : 1) * config.polling[isQuietHours() ? "quiet" : "default"];

const lastModifiedCache = {};

const updateAndGetLastModified = (fromPolling, intKey) => {
  const now = new Date().getTime();
  let value = now;
  if (intKey) {
    if (fromPolling) {
      value = getLastModified(intKey);
      lastModifiedCache[intKey] = value;
    } else {
      value = lastModifiedCache[intKey] || now;
    }
  }
  return value;
};

const checkTriggers = fromPolling => {
  const now = new Date().getTime();
  if ((startTime || now) + STARTUP_TRIGGER_SAFEGUARD > now) {
    return;
  }
  const commands = db.getCollection(COMMANDS);
  commands.forEach(command => {
    if (command.triggers && command.triggers.length > 0) {
      const results = [[], []];
      for (let i = 0; i < command.triggers.length; ++i) {
        const trigger = command.triggers[i];
        const lastModified = updateAndGetLastModified(
          fromPolling,
          trigger.intKey
        );
        const triggerDelta = toSeconds(trigger.duration) * 1000;

        const needsDuration =
          trigger.type === "after" || trigger.type === "inactivity";
        if (needsDuration && isNaN(triggerDelta)) {
          console.log("Bad duration", trigger.duration);
          continue;
        }

        if (trigger.type === "after") {
          const entity = db.getEntity(ENTITIES, trigger.entKey);
          if (trigger.parameter === "state") {
            const matchesState = toBool(trigger.value) === entity.on;
            const inInTriggerRange =
              entity.lastModified &&
              entity.lastModified.on &&
              now > entity.lastModified.on + triggerDelta &&
              now <= entity.lastModified.on + triggerDelta + getInterval(true);
            const shouldTrigger = matchesState && inInTriggerRange;
            results[shouldTrigger ? 0 : 1].push(trigger);
          }
        } else if (trigger.type === "inactivity") {
          if (!trigger.intKey) {
            console.log("Missing intKey from inactivity trigger");
            continue;
          }
          const shouldTrigger = now > lastModified + triggerDelta;
          results[shouldTrigger ? 0 : 1].push(trigger);
        }
      }

      const operator =
        (command.triggers[0].operator || "").toUpperCase() || "OR";
      const shouldRun =
        results[0].length > 0 && (operator === "OR" || results[1].length === 0);
      const commandNotRunRecently =
        now > (bookKeeping[command.id] || 0) + getInterval();
      console.log(
        "trigger results: true",
        results[0].length,
        "false",
        results[1].length,
        operator,
        commandNotRunRecently
      );
      if (shouldRun && commandNotRunRecently) {
        console.log("trigger fired for", command.id);
        bookKeeping[command.id] = new Date().getTime();
        actions.runCommand(command.id);
      }
    }
  });
};

const startTriggerMonitor = appStartTime => {
  console.log("start trigger monitor");
  startTime = appStartTime;

  function doCheck() {
    checkTriggers(true);
    setTimeout(() => {
      doCheck();
    }, getInterval());
  }

  doCheck();
};

module.exports = {
  init,
  startTriggerMonitor,
  checkTriggers
};
