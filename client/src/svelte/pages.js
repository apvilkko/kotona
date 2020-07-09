import Home from "./Home.svelte";
import Commands from "./Commands.svelte";
import Lights from "./integrations/lights/Lights.svelte";
import Weather from "./integrations/weather/Weather.svelte";
import Cameras from "./integrations/security/Cameras.svelte";

export default [
  { path: "/", label: "Home", component: Home },
  { path: "/commands", label: "Commands", component: Commands },
  { path: "/cameras", label: "Cameras", component: Cameras },
  { path: "/lights", label: "Lights", component: Lights },
  { path: "/weather", label: "Weather", component: Weather }
];
