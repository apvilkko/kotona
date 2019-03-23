import React from "react";
import Main from "./Main";

export default [
  { path: "/", label: "Home", component: Main },
  { path: "/commands", label: "Commands", component: () => null },
  { path: "/tasks", label: "Tasks", component: () => null }
];
