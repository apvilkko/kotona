const constants = require("./constants");

const { ATTR_LIGHT_CONTROL, ATTR_SWITCH_PLUG, ATTR_SENSOR } = constants;

const ATTRS = [ATTR_LIGHT_CONTROL, ATTR_SWITCH_PLUG, ATTR_SENSOR];

const isDifferent = (a, b) => {
  /*
  {
    "9001": "Vaatehuone",
    "5750": 2,
    "9002": 1554298869,
    "9020": 1570703627,
    "9003": 65544,
    "9054": 0,
    "9019": 1,
    "3": {
      "0": "IKEA of Sweden",
      "1": "FLOALT panel WS 30x30",
      "2": "",
      "3": "1.2.217",
      "6": 1
    },
    "3311": [ // <-- we're only interested in this part really
      {
        "5710": 26909,
        "5850": 0,
        "5851": 254,
        "5717": 0,
        "5711": 370,
        "5709": 30138,
        "5706": "f1e0b5",
        "9003": 0
      }
    ]
  };
  */
  if (!a || !b) {
    return a !== b;
  }
  for (let y = 0; y < ATTRS.length; ++y) {
    const attr = ATTRS[y];
    if (a[attr] && b[attr]) {
      for (let x = 0; x < a[attr].length; ++x) {
        const item = a[attr][x];
        const keys = Object.keys(item);
        for (let i = 0; i < keys.length; ++i) {
          const key = keys[i];
          if (item[key] !== b[attr][x][key]) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

module.exports = isDifferent;
