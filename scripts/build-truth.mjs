// Parse the merged challenged+afresh data dictionary (tab-separated tables)
// into the canonical schema truth file docs/wp-truth.json.
//
// Source of truth: /mnt/documents/最新数据字典-2026-08.txt
// Run: node scripts/build-truth.mjs && node scripts/gen-wp-constants.mjs
import fs from 'node:fs';

const SRC = process.env.DICT_PATH || '/mnt/documents/最新数据字典-2026-08.txt';
const raw = fs.readFileSync(SRC, 'utf8');
const lines = raw.split('\n');

const ccts = [];
const relations = [];
const byCctId = new Map();
const byRelId = new Map();

let cur = null;        // { kind: 'cct' | 'rel', target }
let fieldsFor = null;  // 'cct' | 'rel' — which table the following a-rows belong to
let lastField = null;
let tableMode = null;  // 'cctName' | 'relName' — set by the column-header row above

const headRe = /^(\d+)\.\s+(.+)$/;

// Dictionary typo overrides: the CCT-name row prints the wrong number while the
// surrounding prose + relation tables use the correct one.
// "146. Notification" → 185 (prose line 1340: CCT “185. Notification”;
//  relation 188 targets "185. Notification").
const CCT_ID_OVERRIDES = new Map([['146|Notification', 185]]);
const optContRe = /^\s*\d+\.\s*[“"']/;

function cell(cells, i) {
  return (cells[i] || '').trim();
}

for (const line of lines) {
  const cells = line.split('\t');
  const first = cell(cells, 0);

  // ── Column-header rows tell us which table follows ──────────────
  if (/Jet Engine CCT Custom Field Label/i.test(line)) { fieldsFor = 'cct'; tableMode = null; lastField = null; continue; }
  if (/Jet Engine Relation Custom Field Label/i.test(line)) { fieldsFor = 'rel'; tableMode = null; lastField = null; continue; }
  if (/Jet Engine Relation Name/i.test(line)) { fieldsFor = null; tableMode = 'relName'; lastField = null; continue; }
  if (/Jet Engine CCT Name/i.test(line)) { fieldsFor = null; tableMode = 'cctName'; lastField = null; continue; }

  // ── Numbered entity rows: "140. Product" / "219. One user can ..." ──
  const m = first.match(headRe);
  if (m) {
    let id = Number(m[1]);
    const name = m[2].trim();
    const ov = CCT_ID_OVERRIDES.get(`${id}|${name}`);
    if (ov) id = ov;
    const relType = cell(cells, 3);
    const isRelation =
      /^(One|Many)\s+to\s+/i.test(relType) ||
      (tableMode === 'relName' && !!cell(cells, 1) && !!cell(cells, 2));

    if (isRelation) {
      let t = byRelId.get(id);
      if (!t) {
        const inferred = relType || (/many related/i.test(name) ? 'One to Many' : 'One to One');
        t = { id, name, parent: cell(cells, 1), child: cell(cells, 2), type: inferred, fields: [] };
        byRelId.set(id, t);
        relations.push(t);
      } else {
        t.parent ||= cell(cells, 1);
        t.child ||= cell(cells, 2);
        t.type ||= relType;
      }
      cur = { kind: 'rel', target: t };
      fieldsFor = null;
      lastField = null;
      continue;
    }

    // CCT definition row: name row inside a "Jet Engine CCT Name" table
    // (identified by trailing empty slug/table/usage cells or no relation type)
    if (!relType && tableMode === 'cctName' && !/Name\/ID:/.test(name) && !/^[“"']/.test(name)) {
      let t = byCctId.get(id);
      if (t && t.name !== name) {
        console.warn(`[collision] CCT id ${id} used by both "${t.name}" and "${name}" — add an override.`);
      }
      if (!t) {
        t = { id, name, fields: [] };
        byCctId.set(id, t);
        ccts.push(t);
      }
      cur = { kind: 'cct', target: t };
      fieldsFor = 'cct';
      tableMode = null;
      lastField = null;
      continue;
    }
  }

  // ── Custom-field rows: label | aNN | type | options ─────────────
  const code = cell(cells, 1);
  if (cur && /^a\d+$/.test(code) && first) {
    const field = {
      label: first,
      code,
      type: cell(cells, 2),
      options: cells.slice(3).join(' ').trim(),
    };
    const target = cur.target;
    // Relation custom fields only when the header said so AND cur is a relation
    if (fieldsFor === 'rel' && cur.kind === 'rel') target.fields.push(field);
    else if (cur.kind === 'cct') target.fields.push(field);
    else target.fields.push(field);
    lastField = field;
    continue;
  }

  // ── Option continuation lines ("2. “No” (Name/ID: b56)") ────────
  if (lastField && optContRe.test(line)) {
    lastField.options += ' ' + line.trim();
  }
}

function parseOptions(str) {
  const out = {};
  if (!str) return out;
  const re = /\d+[.、]?\s*[“"']([^”"']+)[”"']\s*[（(]\s*Name\/ID:\s*([ab]\d+)\s*[）)]/g;
  let m;
  while ((m = re.exec(str))) out[m[2]] = m[1].trim();
  const re2 = /\d+[.、]?\s*([^“"'()]+?)\s*[（(]\s*Name\/ID:\s*([ab]\d+)\s*[）)]/g;
  while ((m = re2.exec(str))) { if (!out[m[2]]) out[m[2]] = m[1].trim(); }
  // Tolerate unbalanced quotes in the dictionary, e.g.
  //   14. “Remote medicine supervision (Name/ID: b68)
  // Without this the option silently vanishes from the generated truth.
  const re3 = /\d+[.、]?\s*[“"']?([^()]+?)\s*[（(]\s*Name\/ID:\s*([ab]\d+)\s*[）)]/g;
  while ((m = re3.exec(str))) { if (!out[m[2]]) out[m[2]] = m[1].replace(/[“”"']/g, '').trim(); }
  return out;

}

// The dictionary repeats a shared CCT's field table once per host object
// (product / shop / facility). Keep the first definition of each field code.
function dedupeFields(list) {
  const seen = new Set();
  return list.filter((f) => (seen.has(f.code) ? false : (seen.add(f.code), true)));
}
for (const c of ccts) c.fields = dedupeFields(c.fields);
for (const r of relations) r.fields = dedupeFields(r.fields);
for (const c of ccts) for (const f of c.fields) f.optionMap = parseOptions(f.options);
for (const r of relations) for (const f of r.fields) f.optionMap = parseOptions(f.options);

// Drop accidental empty entities
const cleanCcts = ccts.filter((c) => c.name && c.name.length > 1);
const cleanRels = relations.filter((r) => r.name && r.parent && r.child);

// Relations created in the JetEngine UI after this dictionary revision was
// exported. Verified live against /wp-json/jet-rel/<id>.

// Fields added in the JetEngine GUI after this dictionary revision was
// exported (verified live against /wp-json/jet-cct/<slug>). Codes and option
// maps come straight from the user's dictionary — never inferred.
const O = (pairs) => ({
  options: pairs.map(([l, c], i) => `${i + 1}. “${l}” (Name/ID: ${c})`).join(' '),
  optionMap: Object.fromEntries(pairs.map(([l, c]) => [c, l])),
});
const FIELD_PATCHES = {
  187: [
    { label: 'Medication concept identifier', code: 'a92', type: 'Text' },
    { label: 'Medication dose quantity', code: 'a93', type: 'Number' },
    { label: 'Medication dose unit', code: 'a94', type: 'Text' },
    { label: 'Medication schedule type', code: 'a95', type: 'Radio', ...O([['asNeeded', 'b55'], ['schedule', 'b56']]) },
    { label: 'Medicine log type', code: 'a96', type: 'Radio', ...O([['AI', 'b55'], ['Human', 'b56']]) },
    { label: 'Checkin log type', code: 'a97', type: 'Radio', ...O([['AI', 'b55'], ['Human', 'b56']]) },
    { label: 'Medicine stock', code: 'a98', type: 'Number' },
    { label: 'Medicine refill', code: 'a99', type: 'Number' },
    { label: 'Medicine prescriber', code: 'a100', type: 'Text' },
    { label: 'Medicine bought pharmacy', code: 'a101', type: 'Text' },
    { label: 'Medicine/checkin to remind caregiver time after missing', code: 'a102', type: 'Number' },
  ],
  // 206 mirrors Apple HKMedicationDoseEvent 1:1 (rebuilt in the JetEngine GUI).
  206: [
    { label: 'Dose event log status', code: 'a55', type: 'Radio', ...O([['notInteracted', 'b55'], ['notLogged', 'b56'], ['notificationNotSent', 'b57'], ['skipped', 'b58'], ['snoozed', 'b59'], ['taken', 'b60']]) },
    { label: 'Dose event note', code: 'a56', type: 'Textarea' },
    { label: 'Dose quantity', code: 'a57', type: 'Number' },
    { label: 'Scheduled dose quantity', code: 'a58', type: 'Number' },
    { label: 'Dose unit', code: 'a59', type: 'Text' },
    { label: 'Scheduled date', code: 'a60', type: 'Datetime' },
    { label: 'Schedule type', code: 'a61', type: 'Radio', ...O([['asNeeded', 'b55'], ['schedule', 'b56']]) },
    { label: 'Concept identifier', code: 'a62', type: 'Text' },
    { label: 'Concept display text', code: 'a63', type: 'Text' },
    { label: 'Concept general form', code: 'a64', type: 'Text' },
    { label: 'Clinical coding system', code: 'a65', type: 'Text' },
    { label: 'Clinical coding code', code: 'a66', type: 'Text' },
    { label: 'Clinical coding version', code: 'a67', type: 'Text' },
    { label: 'Dose logged time', code: 'a68', type: 'Datetime' },
  ],
};
for (const [id, fields] of Object.entries(FIELD_PATCHES)) {
  const cct = cleanCcts.find((c) => Number(c.id) === Number(id));
  if (!cct) continue;
  for (const f of fields) {
    const at = cct.fields.findIndex((x) => x.code === f.code);
    const shaped = { options: '', optionMap: {}, ...f };
    if (at >= 0) cct.fields[at] = shaped; else cct.fields.push(shaped);
  }
}

const EXTRA_RELATIONS = [
  {
    id: 66,
    name: 'One care facility can have many related reviews',
    parent: '215. Care facility',
    child: '31. Review',
    type: 'One to Many',
    fields: [],
  },
  {
    id: 265,
    name: 'One 199. care group can have one related group live 121. chat conversation',
    parent: '199. care group',
    child: '121. Chat Conversation',
    type: 'One to One',
    fields: [],
  },
];
for (const extra of EXTRA_RELATIONS) {
  if (!cleanRels.some((r) => r.id === extra.id)) cleanRels.push(extra);
}


fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync('docs/wp-truth.json', JSON.stringify({ source: SRC, ccts: cleanCcts, relations: cleanRels }, null, 2));
console.log('CCTs:', cleanCcts.length, 'Relations:', cleanRels.length);
console.log('CCT IDs:', cleanCcts.map((c) => c.id).sort((a, b) => a - b).join(','));
console.log('Rel IDs:', cleanRels.map((r) => r.id).sort((a, b) => a - b).join(','));
