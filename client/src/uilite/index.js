console.log("Hello uilite");

const addEl = (name, root) => {
  const rootEl = root || document.getElementById("app");
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

const integration = "weather/openweathermap";

const init = () => {
  const h1 = addEl("h1");
  h1.innerText = "Kotona Lite";
  const url = `/api/entities?type=${encodeURIComponent(integration)}`;
  fetch(url, resp => {
    const pre = addEl("pre");
    pre.innerText = JSON.stringify(resp, null, 2);
  });
};

init();
