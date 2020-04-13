const express = require("express");
const proxy = require("http-proxy-middleware");
const bodyParser = require("body-parser");

const PORTS = require("../ports");
const port = PORTS.bus;
const uiPath = "ui";
const uiLitePath = "lite";
const config = {
  api: { host: "localhost", port: PORTS.commander, removePath: true },
  ws: { host: "localhost", port: PORTS.commander, removePath: true, ws: true },
  [uiPath]: { host: "localhost", port: PORTS.client },
  [uiLitePath]: { host: "localhost", port: PORTS.uilite },
};

const app = express();
const jsonParser = bodyParser.json();

app.post("/error", jsonParser, (req, res) => {
  console.log("Received JS error:");
  console.log(req.body.error);
  res.sendStatus(200);
});

Object.keys(config).forEach((key) => {
  app.use(
    proxy(`/${key}`, {
      target: `http://${config[key].host}:${config[key].port}`,
      pathRewrite: config[key].removePath
        ? {
            [`^/${key}`]: "",
          }
        : null,
      logLevel: "debug",
      ws: config[key].ws,
    })
  );
});

app.get("/", (req, res) => {
  res.redirect(`/${uiPath}`);
});

console.log(`Starting bus on port`, port);
app.listen(port);
