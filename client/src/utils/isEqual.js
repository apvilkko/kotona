function isEqual(x, y, skipped) {
  const ok = Object.keys,
    tx = typeof x,
    ty = typeof y;
  return x && y && tx === "object" && tx === ty
    ? ok(x).length === ok(y).length &&
        ok(x).every(key => {
          if (skipped && skipped.includes(key)) {
            return true;
          }
          return isEqual(x[key], y[key]);
        })
    : x === y;
}

export default isEqual;
