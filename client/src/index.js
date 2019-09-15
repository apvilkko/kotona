import App from "./svelte/App.svelte";
import { SpaRouter } from "svelte-router-spa";
import routes from "./svelte/routes";
import "./styles/reset.css";

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

SpaRouter({
  routes,
  pathName: document.location.href
}).getActiveRoute;

new App({
  target: document.getElementById("app")
});
