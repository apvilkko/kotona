const time = (time, timezone, omitClock, omitDate) => {
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
    delete opts.month;
    delete opts.day;
  }
  return new Date(time * 1000).toLocaleString("fi", opts);
};

export default time;
