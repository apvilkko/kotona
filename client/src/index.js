import "./polyfills";
import "moment/locale/fi";
import App from "./svelte/App.svelte";

import "./styles/reset.scss";
import "./styles/global.scss";
import "./styles/style.scss";

function newEvent(eventName) {
  var event;
  if (typeof Event === "function") {
    event = new Event(eventName);
  } else {
    event = document.createEvent("Event");
    event.initEvent(eventName, true, true);
  }
  return event;
}

try {
  history.pushState = (f =>
    function pushState() {
      var ret = f.apply(this, arguments);
      window.dispatchEvent(newEvent("pushState"));
      window.dispatchEvent(newEvent("locationchange"));
      return ret;
    })(history.pushState);

  history.replaceState = (f =>
    function replaceState() {
      var ret = f.apply(this, arguments);
      window.dispatchEvent(newEvent("replaceState"));
      window.dispatchEvent(newEvent("locationchange"));
      return ret;
    })(history.replaceState);

  window.addEventListener("popstate", () => {
    window.dispatchEvent(newEvent("locationchange"));
  });

  new App({
    target: document.getElementById("app")
  });
} catch (e) {
  console.error(e);
  const errorString = JSON.stringify(e);

  var xmlhttp = new XMLHttpRequest();
  var theUrl = "/error";
  xmlhttp.open("POST", theUrl);
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.send(JSON.stringify({ error: errorString }));
}
