// Parse 最新数据字典.md into the canonical schema truth file.
import fs from 'node:fs';
const src = fs.readFileSync('/mnt/documents/最新数据字典.md', 'utf8');
const lines = src.split('\n');

const ccts = [];        // {id, name, fields:[{label,code,type,options}]}
const relations = [];   // {id, name, parent, child, type, fields:[]}
let cur = null;         // {kind:'cct'|'rel', target}
let inFieldsTable = false;
let headerKind = null;  // 'fields' | 'relFields' | null

const cctRe = /^#+\s*(?:###\s*\d+\)\s*)?CCT[:\s]+(\d+)\.\s*(.+?)\s*$/i;
const relRe = /^#+\s*(?:\d+\)\s*)?Relation[:\s]+(\d+)\.\s*(.+?)\s*$/i;
const relInlineRe = /^###\s*Relation\s*(\d+)\.\s*(.+?)\s*$/i;

for (let i = 0; i < lines.length; i++) {
  const L = lines[i];
  let m;
  if ((m = L.match(cctRe))) {
    cur = { kind: 'cct', target: { id: +m[1], name: m[2].trim(), fields: [] } };
    ccts.push(cur.target);
    headerKind = null;
    continue;
  }
  if ((m = L.match(relRe)) || (m = L.match(relInlineRe))) {
    cur = { kind: 'rel', target: { id: +m[1], name: m[2].trim(), fields: [] } };
    relations.push(cur.target);
    headerKind = null;
    continue;
  }
  // Detect Custom Fields header
  if (/^####\s*(Relation\s*)?Custom Fields/i.test(L) || /^#####\s*(Relation\s*)?Custom Fields/i.test(L)) {
    headerKind = /Relation/i.test(L) ? 'relFields' : 'fields';
    continue;
  }
  // Table rows: | label | code | type | options | ...
  if (cur && /^\|/.test(L) && !/^\|\s*-+/.test(L) && !/Custom Field Label|Jet Engine CCT Name|Relation Name|^\|\s*Label\s*\|/i.test(L)) {
    const cells = L.split('|').slice(1, -1).map(s => s.trim());
    if (cells.length >= 3 && /^[ab]\d+$/.test(cells[1])) {
      const field = { label: cells[0], code: cells[1], type: cells[2] || '', options: cells[3] || '' };
      if (cur.kind === 'cct') cur.target.fields.push(field);
      else cur.target.fields.push(field);
    }
    // relation parent/child row
    if (cur.kind === 'rel' && cells.length >= 4 && /One to|Many to/i.test(cells[3] || '')) {
      cur.target.parent = cells[1];
      cur.target.child = cells[2];
      cur.target.type = cells[3];
    }
    // Inline relation "Parent: X → Child: Y"
  }
  if (cur && cur.kind === 'rel' && /Parent:/i.test(L)) {
    const pm = L.match(/Parent:\s*([^→\-]+?)\s*[→\-]+\s*Child:\s*([^—\-]+?)\s*[—\-]+\s*(One to \w+|Many to \w+)/i);
    if (pm) { cur.target.parent = pm[1].trim(); cur.target.child = pm[2].trim(); cur.target.type = pm[3].trim(); }
  }
}

// Build per-CCT option maps from "1. "X" (b55)" patterns
function parseOptions(str) {
  const out = {};
  if (!str) return out;
  const re = /\d+\.\s*"([^"]+)"\s*\(([ab]\d+)\)/g;
  let m;
  while ((m = re.exec(str))) out[m[2]] = m[1];
  // also handle non-quoted "Yes (b55)" patterns
  const re2 = /\d+\.\s*([A-Za-z][A-Za-z0-9 \-/&'+]+?)\s*\(([ab]\d+)\)/g;
  while ((m = re2.exec(str))) { if (!out[m[2]]) out[m[2]] = m[1].trim(); }
  return out;
}

for (const c of ccts) for (const f of c.fields) f.optionMap = parseOptions(f.options);
for (const r of relations) for (const f of r.fields) f.optionMap = parseOptions(f.options);

fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync('docs/wp-truth.json', JSON.stringify({ ccts, relations }, null, 2));
console.log('CCTs:', ccts.length, 'Relations:', relations.length);
console.log('CCT IDs:', ccts.map(c => c.id).sort((a,b)=>a-b).join(','));
console.log('Rel IDs:', relations.map(r => r.id).sort((a,b)=>a-b).join(','));
