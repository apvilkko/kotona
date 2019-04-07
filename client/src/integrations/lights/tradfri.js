const COLD_WARM_COLORS = ["f5faf6", "f1e0b5", "efd275"];
const RGB_COLORS = [
  "4a418a",
  "6c83ba",
  "8f2686",
  "a9d62b",
  "c984bb",
  "d6e44b",
  "d9337c",
  "da5d41",
  "dc4b31",
  "dcf0f8",
  "e491af",
  "e57345",
  "e78834",
  "e8bedd",
  "eaf6fb",
  "ebb63e",
  "efd275",
  "f1e0b5",
  "f2eccf",
  "f5faf6"
];

const getColorChoices = device => {
  if (device.model.includes("bulb") && device.model.includes("CWS")) {
    return RGB_COLORS;
  } else if (device.model.includes("bulb") && device.model.includes("WS")) {
    return COLD_WARM_COLORS;
  }
  return null;
};

export { getColorChoices };
