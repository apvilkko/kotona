const DEVICES = 15001;
const GROUPS = 15004;
const ATTR_SENSOR = 3300;
const ATTR_LIGHT_CONTROL = 3311;
const ATTR_SWITCH_PLUG = 3312;

const LIGHT_CONTROL = {
  color: 5706,
  colorHue: 5707,
  colorSaturation: 5708,
  colorX: 5709,
  colorY: 5710,
  transition: 5712,
  state: 5850,
  dimmer: 5851
};

const PROPS = {
  name: 9001,
  created: 9002,
  id: 9003,
  lastSeen: 9020,
  manufacturer: "3.0",
  model: "3.1",
  firmwareVersion: "3.3"
};

module.exports = {
  DEVICES,
  GROUPS,
  ATTR_SENSOR,
  ATTR_LIGHT_CONTROL,
  ATTR_SWITCH_PLUG,
  LIGHT_CONTROL,
  PROPS
};
