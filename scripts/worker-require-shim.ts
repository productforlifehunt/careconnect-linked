import type { Plugin } from "vite";

// The Worker host has no CommonJS require; bundled CJS code only asks for these
// Node built-ins, so serve them from static imports instead of createRequire.
const ID = "\0worker-node-module";
const builtins = ["buffer", "events", "stream", "util", "path", "async_hooks", "crypto"];

export function workerRequireShim(): Plugin {
  return {
    name: "worker-require-shim",
    apply: "build",
    enforce: "pre",
    applyToEnvironment: env => env.name === "ssr",
    resolveId(id) {
      return id === "node:module" || id === "module" ? ID : null;
    },
    load(id) {
      if (id !== ID) return null;
      const imports = builtins.map((n, i) => `import * as m${i} from "node:${n}";`).join("\n");
      const map = builtins.map((n, i) => `"${n}": m${i}, "node:${n}": m${i}`).join(", ");
      return `${imports}
const mods = { ${map} };
const unwrap = m => (m && m.default) || m;
export function createRequire() {
  return name => {
    const m = mods[name];
    if (m) return unwrap(m);
    if (/^(node:)?(os|fs)$/.test(name)) return {};
    throw new Error("Cannot require " + name);
  };
}
export default { createRequire };
`;
    },
  };
}
