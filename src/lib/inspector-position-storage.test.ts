import { afterEach, expect, it, vi } from 'vitest';
import { readNoteForKey, readNoteForFingerprint, selectNote } from './inspector-notes.server';

vi.mock('@supabase/supabase-js', () => ({ createClient: () => { throw new Error('Cloud binding storage must not be used'); } }));
const binding = { key: 'el|*|scope:settings-personal-form|@div', id: '10567', scope: 'element' as const, page: '/settings', label: '个人设置', locked: true };
const original = { version: 2, relatedNoteIds: ['10564'], frontendTargets: [{ app: 'afresh', pageKey: '/' }], inspectorBindings: [binding] };
function fixture(normalizeEmpty = false) {
  let row = { _ID: '10567', a55: '个人设置表单', a56: '不可改变的原正文', a58: normalizeEmpty ? null : 'b55', a59: JSON.stringify(original) };
  const writes: { url: string; body: Record<string, unknown> }[] = [];
  vi.stubEnv('WP_ADMIN_USER', 'test'); vi.stubEnv('WP_ADMIN_APP_PASSWORD', 'test');
  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    if (init?.method === 'POST') {
      const body = JSON.parse(String(init.body)) as Record<string, unknown>;
      writes.push({ url, body }); row = { ...row, a59: String(body['a59']), a58: normalizeEmpty ? '' : row.a58 };
      return Response.json(true);
    }
    return Response.json(url.includes('?') ? [row] : row);
  }));
  return { writes, getRow: () => row };
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
it('reads the exact migrated note only through WordPress a59, never Cloud', async () => {
  fixture();
  expect(await readNoteForKey(binding.key)).toMatchObject({ id: '10567', text: '不可改变的原正文', locked: true });
});
it('explicit binding save writes only CCT324 a59 and leaves body, verified state and REL325 metadata intact', async () => {
  const f = fixture(); await selectNote(binding);
  expect(f.writes).toHaveLength(1);
  expect(f.writes[0]?.url).toBe('https://app.challenged-dementia.com/afresh/wp-json/jet-cct/manual_notes/10567');
  expect(Object.keys(f.writes[0]?.body ?? {})).toEqual(['a59']);
  expect(f.getRow()).toMatchObject({ a55: '个人设置表单', a56: '不可改变的原正文', a58: 'b55' });
  expect(JSON.parse(f.getRow().a59)).toEqual(original);
});
it('plugin normalization of an empty verification field does not report a false binding-save failure', async () => {
  fixture(true);
  expect(await selectNote(binding)).toMatchObject({ id: '10567', verified: false });
});

it('recovers one source-verified note with public CCT reads, but refuses ambiguous or changed fingerprints', async () => {
  vi.stubEnv('WP_ADMIN_USER', ''); vi.stubEnv('WP_ADMIN_APP_PASSWORD', '');
  const digest = 'a'.repeat(64);
  const source = { file: 'pages/Test.tsx', line: 5, endLine: 5, tag: 'p', digest };
  const row = (id: string) => ({ _ID: id, a55: `注释 ${id}`, a56: '原文', a59: JSON.stringify({ inspectorBindings: [{ key: `source|${id}`, id, scope: 'element', page: '', label: '', source }] }) });
  let rows = [row('11')];
  vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => {
    expect(new Headers(init?.headers).has('Authorization')).toBe(false);
    return Response.json(rows);
  }));
  const fp = `pages/Test.tsx:5:2:${digest}:1`;
  expect(await readNoteForFingerprint('el|/test|one', fp, 'p', '/test')).toMatchObject({ id: '11', key: 'el|/test|one', text: '原文' });
  expect(await readNoteForFingerprint('el|/test|one', fp, 'span', '/test')).toBeNull();
  expect(await readNoteForFingerprint('el|/test|one', fp.replace(/:1$/, ':0'), 'p', '/test')).toBeNull();
  rows = [row('11'), row('12')];
  expect(await readNoteForFingerprint('el|/test|one', fp, 'p', '/test')).toBeNull();
});
