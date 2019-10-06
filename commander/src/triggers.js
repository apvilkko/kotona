const toSeconds = require("./toSeconds");

let db;
let actions;

const init = (dbRef, actionsRef) => {
  db = dbRef;
  actions = actionsRef;
};

const TRIGGER_INTERVAL = 60000;
//const TRIGGER_INTERVAL = 5000;
const UPPER_LIMIT = TRIGGER_INTERVAL * 1.5;

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

const checkTriggers = () => {
  const commands = db.getCollection(COMMANDS);
  const now = new Date().getTime();
  commands.forEach(command => {
    if (command.triggers && command.triggers.length > 0) {
      const results = [[], []];
      for (let i = 0; i < command.triggers.length; ++i) {
        const trigger = command.triggers[i];
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
              now <= entity.lastModified.on + triggerDelta + UPPER_LIMIT;
            const shouldTrigger = matchesState && inInTriggerRange;
            results[shouldTrigger ? 0 : 1].push(trigger);
          }
        } else if (trigger.type === "inactivity") {
          if (!trigger.intKey) {
            console.log("Missing intKey from inactivity trigger");
            continue;
          }
          const lastModified = getLastModified(trigger.intKey);
          const shouldTrigger = now > lastModified + triggerDelta;
          results[shouldTrigger ? 0 : 1].push(trigger);
        }
      }

      const operator =
        (command.triggers[0].operator || "").toUpperCase() || "OR";
      const shouldRun =
        results[0].length > 0 && (operator === "OR" || results[1].length === 0);
      const commandNotRunRecently =
        now > (bookKeeping[command.id] || 0) + TRIGGER_INTERVAL;
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

const startTriggerMonitor = () => {
  console.log("start trigger monitor");
  setInterval(() => {
    checkTriggers();
  }, TRIGGER_INTERVAL);
};

module.exports = {
  init,
  startTriggerMonitor,
  checkTriggers
};
