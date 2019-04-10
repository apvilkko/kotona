const pickCurrently = [
  "time",
  "icon",
  "precipIntensity",
  "precipProbability",
  "precipType",
  "temperature",
  "apparentTemperature",
  "humidity",
  "windSpeed",
  "windGust",
  "cloudCover"
];

const pickForecast = [
  "time",
  "icon",
  "precipIntensity",
  "precipIntensityMax",
  "precipIntensityMaxTime",
  "precipProbability",
  "precipType",
  "temperatureHigh",
  "temperatureHighTime",
  "temperatureLow",
  "temperatureLowTime",
  "apparentTemperatureHigh",
  "apparentTemperatureHighTime",
  "apparentTemperatureLow",
  "apparentTemperatureLowTime",
  "humidity",
  "windSpeed",
  "windGust",
  "windGustTime",
  "windBearing",
  "cloudCover",
  "temperatureMin",
  "temperatureMinTime",
  "temperatureMax",
  "temperatureMaxTime",
  "apparentTemperatureMin",
  "apparentTemperatureMinTime",
  "apparentTemperatureMax",
  "apparentTemperatureMaxTime"
];

const pick = keys => obj => {
  const ret = {};
  Object.keys(obj)
    .filter(key => keys.includes(key))
    .forEach(key => {
      ret[key] = obj[key];
    });
  return ret;
};

const getTime = time => new Date(time * 1000);

const processForecast = data => {
  const timezone = data.timezone;
  const currentlyTime = getTime(data.currently.time);
  const hourlyTimes = [3, 6, 9];
  const hourlyPicks = [];
  let i = 0;
  data.hourly.data.forEach(hour => {
    const hourTime = getTime(hour.time);
    const diffMinutes = (hourTime - currentlyTime) / 1000 / 60;
    if (
      i < hourlyTimes.length &&
      diffMinutes <= hourlyTimes[i] * 60 &&
      diffMinutes > (hourlyTimes[i] - 1) * 60
    ) {
      hourlyPicks.push(hour);
      i++;
    }
  });
  const ret = {
    currently: data.currently,
    hourly: hourlyPicks
  };
  return ret;
};

module.exports = processForecast;
