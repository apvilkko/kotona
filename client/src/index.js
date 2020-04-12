import App from "./svelte/App.svelte";

import "./styles/reset.scss";
import "./styles/global.scss";
import "./styles/style.scss";

history.pushState = (f =>
  function pushState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event("pushState"));
    window.dispatchEvent(new Event("locationchange"));
    return ret;
  })(history.pushState);

history.replaceState = (f =>
  function replaceState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event("replaceState"));
    window.dispatchEvent(new Event("locationchange"));
    return ret;
  })(history.replaceState);

window.addEventListener("popstate", () => {
  window.dispatchEvent(new Event("locationchange"));
});

new App({
  target: document.getElementById("app")
});
