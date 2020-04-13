const dec2hex = i => (i + 0x100).toString(16).substr(-2);

const msb16 = (byte1, byte2) => {
  return Number(`0x${dec2hex(byte1) + dec2hex(byte2)}`);
};

const preprocess = itemData => {
  let data;
  if (Array.isArray(itemData)) {
    data = itemData.map(Number);
  } else {
    const hex = [];
    for (let i = 0; i < itemData.length - 1; i += 2) {
      hex.push("0x" + itemData[i] + itemData[i + 1]);
    }
    data = hex.map(Number);
  }
  return data;
};

const getTemperature = data => {
  if (data[0] === 3) {
    // V3
    const sign = data[2] > 127 ? -1 : 1;
    const value = sign === -1 ? data[2] - 128 : data[2];
    return sign * value + data[3] / 100;
  } else if (data[0] === 5) {
    // V5
    let val = msb16(data[1], data[2]);
    if (val > 0x7fff) {
      // Two's complement
      val = -((~val + 1) & 0xffff);
    }
    return val * 0.005;
  }
  return -1;
};

const getHumidity = data => {
  if (data[0] === 3) {
    return data[1] / 2;
  } else if (data[0] === 5) {
    // V5
    const value = msb16(data[3], data[4]);
    return value * 0.0025;
  }
  return -1;
};
export { getTemperature, getHumidity, preprocess };
