import Main from "./Main";
import Commands from "./Commands";
import Lights from "./integrations/lights/Lights.js";
import Weather from "./integrations/weather/Weather.js";

export default [
  { path: "/", label: "Home", component: Main },
  { path: "/commands", label: "Commands", component: Commands },
  { path: "/lights", label: "Lights", component: Lights },
  { path: "/weather", label: "Weather", component: Weather }
];
