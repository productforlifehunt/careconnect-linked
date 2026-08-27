// Dictionary compliance audit.
//
// Scans every frontend source file for raw opaque codes (aNN field codes, bNN
// option codes) and verifies each one exists on a CCT or JetEngine relation the
// same file actually references. A code that resolves nowhere is a dictionary
// violation: it was copied from an older revision of the backend.
//
// Run: node scripts/audit-dict-compliance.mjs
import fs from 'node:fs';
import path from 'node:path';

const truth = JSON.parse(fs.readFileSync('docs/wp-truth.json', 'utf8'));
const schema = fs.readFileSync('src/integrations/wp-schema.ts', 'utf8');

// alias -> cct id  (from `export const T = { alias: WP.cct["NN"] }`)
const aliasToCct = new Map();
for (const m of schema.matchAll(/^\s{2}(\w+): WP\.cct\["(\d+)"\],/gm)) {
  aliasToCct.set(m[1], Number(m[2]));
}
// alias -> relation id (from `export const R = { alias: NNN,`)
const relAliasToId = new Map();
const rBlock = schema.slice(schema.indexOf('export const R = {'));
for (const m of rBlock.matchAll(/^\s{2}(\w+):\s*(\d+),/gm)) {
  relAliasToId.set(m[1], Number(m[2]));
}

const cctById = new Map(truth.ccts.map((c) => [c.id, c]));
const relById = new Map(truth.relations.map((r) => [r.id, r]));

function codesOf(entity) {
  const fields = new Set();
  const options = new Set();
  for (const f of entity.fields || []) {
    fields.add(f.code);
    for (const k of Object.keys(f.optionMap || {})) options.add(k);
  }
  return { fields, options };
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

const SKIP = [
  'src/integrations/wp-schema.ts',
  'src/data/mockData.ts',
  'src/integrations/supabase/types.ts',
];

const violations = [];
let filesWithCodes = 0;
let codesChecked = 0;

for (const file of walk('src')) {
  if (SKIP.includes(file)) continue;
  const src = fs.readFileSync(file, 'utf8');

  // Raw codes: only string literals or bare object keys like `a68:` / `.a68`
  const raw = new Set();
  for (const m of src.matchAll(/["'](a\d{2,3}|b\d{2,3})["']/g)) raw.add(m[1]);
  for (const m of src.matchAll(/(?:^|[\s{,(])(a\d{2,3})\s*:/gm)) raw.add(m[1]);
  for (const m of src.matchAll(/\.(a\d{2,3})\b/g)) raw.add(m[1]);
  if (raw.size === 0) continue;
  filesWithCodes++;

  // Which entities does this file reference?
  const fields = new Set();
  const options = new Set();
  const refs = [];
  for (const m of src.matchAll(/\bT\.(\w+)\b/g)) {
    const id = aliasToCct.get(m[1]);
    if (id && cctById.has(id)) {
      refs.push(`CCT ${id}`);
      const c = codesOf(cctById.get(id));
      c.fields.forEach((x) => fields.add(x));
      c.options.forEach((x) => options.add(x));
    }
  }
  for (const m of src.matchAll(/WP\.cct\["(\d+)"\]/g)) {
    const id = Number(m[1]);
    if (cctById.has(id)) {
      refs.push(`CCT ${id}`);
      const c = codesOf(cctById.get(id));
      c.fields.forEach((x) => fields.add(x));
      c.options.forEach((x) => options.add(x));
    }
  }
  for (const m of src.matchAll(/\bR\.(\w+)\b/g)) {
    const id = relAliasToId.get(m[1]);
    if (id && relById.has(id)) {
      refs.push(`REL ${id}`);
      const c = codesOf(relById.get(id));
      c.fields.forEach((x) => fields.add(x));
      c.options.forEach((x) => options.add(x));
    }
  }
  for (const m of src.matchAll(/\b(?:REL|rel|relation)\D{0,12}\b(\d{3})\b/g)) {
    const id = Number(m[1]);
    if (relById.has(id)) {
      refs.push(`REL ${id}`);
      const c = codesOf(relById.get(id));
      c.fields.forEach((x) => fields.add(x));
      c.options.forEach((x) => options.add(x));
    }
  }

  for (const code of [...raw].sort()) {
    codesChecked++;
    const ok = code.startsWith('a') ? fields.has(code) : options.has(code);
    if (!ok) {
      violations.push({ file, code, refs: [...new Set(refs)].join(' ') || '(no entity refs)' });
    }
  }
}

const byFile = new Map();
for (const v of violations) {
  if (!byFile.has(v.file)) byFile.set(v.file, []);
  byFile.get(v.file).push(v);
}

console.log(`Files containing raw codes: ${filesWithCodes}`);
console.log(`Codes checked: ${codesChecked}`);
console.log(`Unresolved codes: ${violations.length}\n`);
for (const [file, vs] of [...byFile].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`${file}  [${vs[0].refs}]`);
  console.log(`   ${vs.map((v) => v.code).join(', ')}`);
}
process.exit(violations.length ? 1 : 0);
