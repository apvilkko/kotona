const time = (time, timezone, omitClock, omitDate, withWeekday) => {
  const opts = {
    weekday: "short",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timezone
  };
  if (omitClock) {
    delete opts.hour;
    delete opts.minute;
  }
  if (omitDate) {
    if (!withWeekday) {
      delete opts.weekday;
    }
    delete opts.month;
    delete opts.day;
  }
  return new Date(time * 1000).toLocaleString("fi", opts);
};

export default time;
