const express = require("express");
const proxy = require("http-proxy-middleware");

const PORTS = require("../ports");
const port = PORTS.bus;
const uiPath = "ui";
const config = {
  api: { host: "localhost", port: PORTS.commander, removePath: true },
  [uiPath]: { host: "localhost", port: PORTS.client }
};

const app = express();

Object.keys(config).forEach(key => {
  app.use(
    proxy(`/${key}`, {
      target: `http://${config[key].host}:${config[key].port}`,
      pathRewrite: config[key].removePath
        ? {
            [`^/${key}`]: ""
          }
        : null,
      logLevel: "debug"
    })
  );
});

app.get("/", (req, res) => {
  res.redirect(`/${uiPath}`);
});

console.log(`Starting bus on port`, port);
app.listen(port);
