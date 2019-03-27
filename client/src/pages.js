import React from "react";
import Main from "./Main";
import Commands from "./Commands";

export default [
  { path: "/", label: "Home", component: Main },
  { path: "/commands", label: "Commands", component: Commands },
  { path: "/tasks", label: "Tasks", component: () => null }
];
