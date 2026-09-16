const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function defaultData() {
  return {
    business: { name: 'Mi Local' },
    services: [
      { id: crypto.randomUUID(), name: 'Atencion general', prefix: 'A', active: true },
    ],
    counters: [
      { id: crypto.randomUUID(), name: 'Puesto 1', active: true },
    ],
    tickets: [],
  };
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function load() {
  if (!fs.existsSync(DB_PATH)) {
    const data = defaultData();
    save(data);
    return data;
  }
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    const data = defaultData();
    save(data);
    return data;
  }
}

function save(data) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Node ejecuta este modulo en un unico hilo y fs.*Sync bloquea el event
// loop hasta terminar, asi que una lectura+escritura no puede intercalarse
// con otra: no hace falta un lock adicional para evitar condiciones de carrera.
function transaction(fn) {
  const data = load();
  const result = fn(data);
  save(data);
  return result;
}

module.exports = { transaction, todayKey, DB_PATH };
