const convertWindDeg = degrees => {
  const ranges = ["↓", "↙", "←", "↖", "↑", "↗", "→", "↘"].map((x, i) => [
    x,
    degrees > 45 * (i + 1) - 22.5
  ]);
  const filtered = ranges.filter(x => !x[1]);
  if (filtered.length) {
    return filtered[0][0];
  }
  return "↓";
};

export default convertWindDeg;
