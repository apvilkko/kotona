const MULTIPLIERS = {
  s: 1,
  m: 60,
  h: 60 * 60
};

const toSeconds = value => {
  if (!value) {
    return 0;
  }
  if (typeof value === "number") {
    return value;
  }
  if (!isNaN(Number(value))) {
    return Number(value);
  }
  let parts = value.split(/(\d+)/).slice(1);
  if (!parts.length) {
    return NaN;
  }
  let total = 0;
  while (parts.length >= 2) {
    const val = Number(parts[0]);
    const unit = parts[1].toLowerCase();
    const mul = MULTIPLIERS[unit];
    if (!mul) {
      return NaN;
    }
    total += val * mul;
    parts = parts.slice(2);
  }
  return total;
};

module.exports = toSeconds;
