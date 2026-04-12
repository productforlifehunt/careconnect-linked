const fs = require("fs");
const path = require("path");

const SCHEMA_DIR = path.join(__dirname, "schema");

/**
 * Get all schema SQL modules in order.
 * @returns {{ name: string, sql: string }[]}
 */
function getSchemaModules() {
  return fs
    .readdirSync(SCHEMA_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => ({
      name: f.replace(/\.sql$/, "").replace(/^\d+_/, ""),
      sql: fs.readFileSync(path.join(SCHEMA_DIR, f), "utf-8"),
    }));
}

/**
 * Get the full combined schema as a single SQL string.
 * @returns {string}
 */
function getFullSchema() {
  return getSchemaModules()
    .map((m) => m.sql)
    .join("\n\n");
}

/**
 * Get schema for specific modules only.
 * @param {string[]} moduleNames - e.g. ['product', 'cart', 'customer']
 * @returns {string}
 */
function getModuleSchema(moduleNames) {
  const all = getSchemaModules();
  const selected = all.filter((m) => moduleNames.includes(m.name));
  return selected.map((m) => m.sql).join("\n\n");
}

/**
 * List available module names.
 * @returns {string[]}
 */
function listModules() {
  return getSchemaModules().map((m) => m.name);
}

module.exports = {
  getSchemaModules,
  getFullSchema,
  getModuleSchema,
  listModules,
};
