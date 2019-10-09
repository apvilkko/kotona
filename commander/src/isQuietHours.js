function isQuietHours(date) {
  const hour = (date || new Date()).getHours();
  // TODO "quiet hours" in config
  return hour >= 23 || hour < 6;
}

module.exports = isQuietHours;
