const path = require("path");
const sqlite3 = require("sqlite3").verbose();

let instance;
let db;

const init = (filename) => {
  if (!instance) {
    const dbfile =
      filename || path.resolve(__dirname, "../data/measurements.db");
    instance = new sqlite3.Database(dbfile);
    console.log(`Using db file ${dbfile}`);
    db = instance;
    db.serialize(function () {
      db.run(`
CREATE TABLE IF NOT EXISTS measurements (
  id INTEGER PRIMARY KEY,
  data TEXT,
  temperature REAL,
  humidity REAL,
  entity INTEGER NOT NULL,
  datetime INTEGER,
  FOREIGN KEY(entity) REFERENCES entities(id)
);
`);
      db.run(`
CREATE TABLE IF NOT EXISTS entities (
  id INTEGER PRIMARY KEY,
  name TEXT,
  entityId TEXT NOT NULL UNIQUE
);
`);
      db.run(`
CREATE TABLE IF NOT EXISTS saunamode (
  id INTEGER PRIMARY KEY,
  started INTEGER
)
`);
    });
  }
  return instance;
};

const saveEntity = (e) => {
  let id;
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT id FROM entities WHERE entityId='${e.entityId}';`,
        (err, row) => {
          if (err) {
            console.error(err);
            reject();
            return;
          }
          id = row ? row.id : undefined;
          db.serialize(function () {
            if (!id) {
              db.run(
                `INSERT INTO entities(entityId) VALUES('${e.entityId}');`,
                function () {
                  id = this.lastID;
                }
              );
            }
            db.run(
              `UPDATE entities SET name='${e.name}' WHERE entityId='${e.entityId}';`,
              () => {
                resolve(id);
              }
            );
          });
        }
      );
    });
  });
};

const getSaunaMode = () =>
  new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(`SELECT id,started FROM saunamode LIMIT 1;`, (err, rows) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        resolve(rows.length > 0 ? rows[0] : undefined);
      });
    });
  });

const setSaunaMode = (started) => {
  db.serialize(function () {
    db.get(`SELECT id FROM saunamode WHERE id > 0;`, (err, row) => {
      if (err) {
        console.error(err);
        return;
      }
      let id = row ? row.id : undefined;
      db.serialize(function () {
        if (!id) {
          db.run(
            `INSERT INTO saunamode(started) VALUES(NULL);`,
            function (ierr) {
              if (ierr) {
                console.error(ierr);
                return;
              } else {
                id = this.lastID;
              }
            }
          );
        }
        if (id) {
          db.run(`
UPDATE saunamode SET
started=${started ? "'" + new Date().getTime() + "'" : "NULL"}
WHERE id=${id};
`);
        }
      });
    });
  });
};

const saveMeasurement = (m, id) => {
  db.serialize(function () {
    db.get(
      `SELECT EXISTS(SELECT 1 FROM measurements WHERE entity='${id}');`,
      (err, row) => {
        if (err) {
          console.error(err);
          return;
        }
        const exists = !!Object.values(row)[0];
        db.serialize(function () {
          if (!exists) {
            db.run(`INSERT INTO measurements(entity) VALUES('${id}');`);
          }
          db.run(`
  UPDATE measurements SET
  temperature=${m.temperature},
  humidity=${m.humidity},
  data='${m.data}',
  datetime='${m.datetime || new Date().getTime()}'
  WHERE entity='${id}';
  `);
        });
      }
    );
  });
};

const getMeasurements = () =>
  new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT measurements.id AS id, temperature, humidity, name, datetime, entityId
FROM measurements
INNER JOIN entities ON measurements.entity=entities.id;`,
        (err, rows) => {
          if (err) {
            console.error(err);
            reject(err);
            return;
          }
          resolve(rows);
        }
      );
    });
  });

const getEntity = (mac) =>
  new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(`SELECT id FROM entities WHERE entityId='${mac}';`, (err, row) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        resolve(row);
      });
    });
  });

const getLatestTimestamp = () =>
  new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT datetime FROM measurements ORDER BY datetime DESC LIMIT 1;`,
        (err, rows) => {
          if (err) {
            console.error(err);
            reject(err);
            return;
          }
          resolve(rows.length > 0 ? rows[0].datetime : undefined);
        }
      );
    });
  });

module.exports = {
  init,
  saveEntity,
  saveMeasurement,
  getMeasurements,
  getLatestTimestamp,
  getEntity,
  setSaunaMode,
  getSaunaMode,
};
