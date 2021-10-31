const express = require("express");
const bodyParser = require("body-parser");
const {
  getMeasurements,
  getEntity,
  saveMeasurement,
  setSaunaMode,
  getSaunaMode,
  saveEntity,
} = require("./db");

const app = express();
app.use(bodyParser.json());

const PORT = require("../../../ports.json").measurements;

const startServer = (cb) => {
  app.get("/", async (req, res) => {
    const data = await getMeasurements();
    res.setHeader("Content-Type", "application/json");
    const obj = data.reduce((acc, curr) => {
      acc[curr.name] = curr;
      return acc;
    }, {});
    res.end(JSON.stringify(obj, null, 2));
  });

  app.post("/", async (req, res) => {
    const tags = req.body ? req.body.tags : undefined;
    if (tags && tags.length) {
      for (let i = 0; i < tags.length; ++i) {
        const tag = tags[i];
        const entityId = tag ? tag.id : undefined;
        if (entityId && tag.updateAt) {
          saveEntity({ entityId, name: tag.name }).then((id) =>
            saveMeasurement(
              {
                data: "05",
                temperature: tag.temperature,
                humidity: tag.humidity,
                datetime: new Date(tag.updateAt).getTime(),
              },
              id
            )
          );
        }
      }
    }
    res.end("ok");
  });

  app.get("/saunamode", async (req, res) => {
    const data = await getSaunaMode();
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data, null, 2));
  });

  app.post("/saunamode", async (req, res) => {
    setSaunaMode(true);
    res.end("ok");
  });

  app.delete("/saunamode", async (req, res) => {
    setSaunaMode(null);
    res.status(204).send();
  });

  return app.listen(PORT, () => {
    console.log(`Measurements API running at port ${PORT}`);
    cb();
  });
};

module.exports = { startServer };
