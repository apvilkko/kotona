const express = require("express");
const { getMeasurements } = require("./db");
const app = express();

const PORT = require("../../../ports.json").measurements;

const startServer = (cb) => {
  app.get("/", async (req, res) => {
    const data = await getMeasurements();
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data, null, 2));
  });

  return app.listen(PORT, () => {
    console.log(`Measurements API running at port ${PORT}`);
    cb();
  });
};

module.exports = { startServer };
