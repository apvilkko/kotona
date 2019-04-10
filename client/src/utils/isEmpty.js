const isEmpty = val => {
  if (val === undefined) return true;

  if (
    typeof val == "function" ||
    typeof val == "number" ||
    typeof val == "boolean" ||
    Object.prototype.toString.call(val) === "[object Date]"
  )
    return false;

  if (val == null || val.length === 0)
    // null or 0 length array
    return true;

  if (typeof val == "object") {
    // empty object
    var r = true;
    for (var f in val) r = false;
    return r;
  }

  return false;
};

export default isEmpty;
