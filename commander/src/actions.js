const COMMANDS = "commands";
const ENTITIES = "entities";

let db;
let integrations;

const init = (dbRef, integrationsRef) => {
  db = dbRef;
  integrations = integrationsRef;
};

const getOpposite = value => {
  if (value && value !== "off") {
    return "off";
  }
  return "on";
};

const runCommand = async commandId => {
  const command = db.getEntity(COMMANDS, commandId);
  console.log("run command:", command.name);
  const acts = command.actions || [];
  let currentValue = null;
  for (let i = 0; i < acts.length; ++i) {
    const { parameter, value, intKey, entKey } = acts[i];
    if (intKey && entKey && parameter) {
      const dbEntity = db.getEntity(ENTITIES, entKey);
      const entityId = dbEntity.entityId;
      if (command.type === "switch") {
        if (currentValue === null) {
          // Get current value first for switch type
          currentValue = await integrations[intKey].getEntityState(
            dbEntity,
            parameter
          );
        }
        console.log(
          `switching ${entKey}/${entityId} "${parameter}" from ${currentValue} to ${getOpposite(
            currentValue
          )}`
        );
        await integrations[intKey].setEntityState(
          entityId,
          parameter,
          getOpposite(currentValue)
        );
      } else {
        console.log(`setting ${entKey}/${entityId} "${parameter}" to ${value}`);
        await integrations[intKey].setEntityState(entityId, parameter, value);
      }
    }
  }
};

module.exports = {
  init,
  runCommand
};
