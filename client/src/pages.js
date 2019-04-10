import Main from "./Main";
import Commands from "./Commands";
import All from "./All.js";

export default [
  { path: "/", label: "Home", component: Main },
  { path: "/commands", label: "Commands", component: Commands },
  { path: "/all", label: "All", component: All }
];
