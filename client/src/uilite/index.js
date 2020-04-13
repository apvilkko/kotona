import "./style.scss";
import {
  getTemperature,
  getHumidity,
  preprocess
} from "../svelte/integrations/weather/ruuvitag";

const DEBUG = false;

try {
  const addEl = (name, id) => {
    const rootEl = document.getElementById(id || "app1");
    const el = document.createElement(name);
    rootEl.appendChild(el);
    return el;
  };

  const fetch = (url, cb) => {
    var req = new XMLHttpRequest();
    req.overrideMimeType("application/json");
    req.open("GET", url, true);
    req.onload = function() {
      var jsonResponse = JSON.parse(req.responseText);
      cb(jsonResponse);
    };
    req.send(null);
  };

  const padStart = (str, maxLength, fillString) => {
    let out = "" + str;
    while (out.length <= maxLength) {
      out = fillString + out;
    }
    return out.substring(0, maxLength);
  };

  const time = (dt, omitClock, clockOnly) => {
    const value = new Date(dt * 1000);
    const weekday = ["su", "ma", "ti", "ke", "to", "pe", "la"][value.getDay()];
    const clock = `klo ${value.getHours()}.${padStart(
      value.getMinutes(),
      2,
      0
    )}`;
    if (clockOnly) {
      return clock;
    }
    return `${weekday} ${value.getDate()}.${value.getMonth() + 1}${
      omitClock ? "" : ` ${clock}`
    }`;
  };

  const section = (...args) => {
    const value = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
    const data = value.map(x => `${x}<br>`);
    return `<p>${data.join("")}</p>`;
  };

  const unit = val => `<span class="unit">${val}</span>`;

  const weatherbox = (value, omitClock) => {
    let parts = [time(value.dt, omitClock)];
    if (typeof value.temp === "number") {
      parts.push(
        `${value.temp}${unit("°")}  (${value.feels_like}${unit("°")})`
      );
    } else {
      parts.push(
        `<strong>päivä</strong> ${value.temp.day}${unit("°")} (${
          value.feels_like.day
        }${unit("°")})`
      );
      parts.push(
        `<strong>yö</strong> ${value.temp.night}${unit("°")} (${
          value.feels_like.night
        }${unit("°")})`
      );
    }
    parts = parts.concat([
      `${value.wind_speed} ${unit("m/s")} (${value.wind_deg}${unit("°")})`,
      `${value.weather[0].description}`
    ]);
    return section(parts);
  };

  const fetchWeather = () => {
    const integration = "weather/openweathermap";
    const url = `/api/entities?type=${encodeURIComponent(integration)}`;
    fetch(url, resp => {
      const format1 = Object.values(resp[0])[0];
      const data = typeof format1 === "object" ? format1 : resp[0];

      const curEl = addEl("div");
      curEl.innerHTML = weatherbox(data.current);

      const forecastEl = addEl("div");
      forecastEl.innerHTML = data.daily
        .map((x, i) => (i < 4 ? weatherbox(x, true) : ""))
        .join("");
    });
  };

  const fetchTags = () => {
    const integration = "weather/ruuvitag";
    const url = `/api/entities?type=${encodeURIComponent(integration)}`;
    fetch(url, resp => {
      const data = resp;

      const curEl = addEl("div", "app2");
      curEl.innerHTML = data
        .map(x => {
          return (
            `<h2>${x.name}</h2>` +
            section(
              `${getTemperature(preprocess(x.data)).toFixed(1)}${unit("°")}`,
              `${getHumidity(preprocess(x.data)).toFixed(1)} ${unit("%")}`,
              `<small>${time(x.meta.updated / 1000, false, true)}</small>`
            )
          );
        })
        .join("");

      if (DEBUG) {
        const pre = addEl("pre", "debug");
        pre.innerText = JSON.stringify(data, null, 2);
      }
    });
  };

  const init = () => {
    const h1 = addEl("h1");
    h1.innerText = "Kotona Lite";

    fetchWeather();
    fetchTags();
  };

  init();
} catch (e) {
  console.error(e);
  const errorString = JSON.stringify(e);

  var xmlhttp = new XMLHttpRequest();
  var theUrl = "/error";
  xmlhttp.open("POST", theUrl);
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.send(JSON.stringify({ error: errorString }));
}
