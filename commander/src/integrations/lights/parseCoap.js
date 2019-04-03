const PATTERN = /\}\w/;

const trimExtra = str => {
  const match = PATTERN.exec(str);
  if (match) {
    return str.substring(0, match.index + 1);
  }
  return str;
};

module.exports = str => {
  const splitLines = str.split("\n");
  const goodIndexes = [];
  for (let i = 0; i < splitLines.length; ++i) {
    const line = splitLines[i];
    if (line.startsWith("[") || line.startsWith("{")) {
      goodIndexes.push(i);
    }
  }
  const goodlines = splitLines
    .filter((x, i) => goodIndexes.includes(i))
    .map(trimExtra);
  if (goodlines.length) {
    return goodlines.map(x => {
      try {
        return JSON.parse(x);
      } catch (e) {
        return {};
      }
    });
  }
};
