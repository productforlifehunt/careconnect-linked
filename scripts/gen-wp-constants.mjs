import fs from 'node:fs';
const truth = JSON.parse(fs.readFileSync('docs/wp-truth.json','utf8'));

// Heuristic: derive a stable constant name from each field label
function toIdent(s) {
  return s.replace(/[^A-Za-z0-9]+/g,'_').replace(/^_|_$/g,'').toUpperCase();
}
function cctConstName(c) {
  return 'CCT_' + toIdent(c.name).replace(/^_+/,'');
}
function relConstName(r) {
  return 'REL_' + toIdent(r.name).replace(/^_+/,'').slice(0,80);
}

let out = `// AUTO-GENERATED from /mnt/documents/最新数据字典.md — DO NOT EDIT BY HAND.
// Source of truth: scripts/build-truth.mjs → docs/wp-truth.json
// Re-run \`node scripts/gen-wp-constants.mjs\` after updating the dictionary.

export const WP = {
  cct: {
`;
for (const c of truth.ccts) {
  out += `    /** ${c.name} */\n    "${c.id}": {\n      id: ${c.id},\n      name: ${JSON.stringify(c.name)},\n      fields: {\n`;
  for (const f of c.fields) {
    const key = toIdent(f.label);
    out += `        ${JSON.stringify(key)}: ${JSON.stringify(f.code)},  // ${f.type}${Object.keys(f.optionMap||{}).length?'  '+JSON.stringify(f.optionMap):''}\n`;
  }
  out += `      },\n    },\n`;
}
out += `  },\n  rel: {\n`;
for (const r of truth.relations) {
  out += `    /** ${r.name} */\n    "${r.id}": { id: ${r.id}, name: ${JSON.stringify(r.name)}`;
  if (r.fields.length) {
    out += `, fields: {\n`;
    for (const f of r.fields) {
      const key = toIdent(f.label);
      out += `      ${JSON.stringify(key)}: ${JSON.stringify(f.code)},${Object.keys(f.optionMap||{}).length?'  // '+JSON.stringify(f.optionMap):''}\n`;
    }
    out += `    } },\n`;
  } else out += ` },\n`;
}
out += `  },
} as const;

// Convenience: get the opaque option code for an option label, per field.
export function optionCode(ctx: { ccts?: keyof typeof WP.cct; rel?: keyof typeof WP.rel }, _fieldKey: string, _optionLabel: string): string | null {
  // Look-ups happen at call-site using the inline maps in this file.
  return null;
}
`;

fs.mkdirSync('src/integrations', { recursive: true });
fs.writeFileSync('src/integrations/wp-schema.ts', out);
console.log('Wrote', out.length, 'bytes');
