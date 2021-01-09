const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.resolve(__dirname, '../data/measurements.db'));

const init = () => {
  db.serialize(function() {
    db.run(`
CREATE TABLE IF NOT EXISTS measurements (
  id INTEGER PRIMARY KEY,
  data TEXT,
  temperature REAL,
  humidity REAL,
  entity INTEGER NOT NULL,
  datetime TEXT,
  FOREIGN KEY(entity) REFERENCES entities(id)
);
`);
    db.run(`
CREATE TABLE IF NOT EXISTS entities (
  id INTEGER PRIMARY KEY,
  name TEXT,
  entityId TEXT NOT NULL UNIQUE
);
`)
  });
}

const saveEntity = entity => {
  db.serialize(function() {
    db.run(`INSERT OR IGNORE INTO entities(name, entityId) VALUES('${entity.name}','${entity.entityId}');`);
  });
}

const saveMeasurement = m => {
  db.serialize(function() {
    db.get(`SELECT EXISTS(SELECT 1 FROM measurements WHERE entity='${m.entityId}');`, (err, row) => {
      const exists = !!Object.values(row)[0];
      if (!exists) {
        db.run(`INSERT INTO measurements(entity) VALUES('${m.entityId}');`);
      }
      db.run(`
UPDATE measurements SET
temperature=${m.temperature},
humidity=${m.humidity},
data='${m.data}',
datetime=datetime('now')
WHERE entity='${m.entityId}';
`)
    });
  });
}

module.exports = {
  init, saveEntity, saveMeasurement
}
