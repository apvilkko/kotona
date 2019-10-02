import Home from "./Home.svelte";
import Commands from "./Commands.svelte";
import Lights from "./integrations/lights/Lights.svelte";
import Weather from "./integrations/weather/Weather.svelte";

export default [
  { path: "/", label: "Home", component: Home },
  { path: "/commands", label: "Commands", component: Commands },
  { path: "/lights", label: "Lights", component: Lights },
  { path: "/weather", label: "Weather", component: Weather }
];
