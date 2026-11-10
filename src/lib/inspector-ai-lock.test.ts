import { afterEach, expect, it, vi } from 'vitest';
import { readNoteById, updatePlainNote } from './inspector-notes.server';

function fixture(aiLocked: string | undefined) {
  let row = { _ID: '6856', a55: '人工标准', a56: '不改一个字', a58: 'b55', a60: 'b56', a61: '', a66: aiLocked };
  const writes: Record<string, unknown>[] = [];
  vi.stubGlobal('fetch', vi.fn(async (_url, init) => {
    if (init?.method === 'POST') {
      const body = JSON.parse(init.body);
      writes.push(body); row = { ...row, ...body };
    }
    return Response.json(row);
  }));
  return writes;
}
const edit = { title: '人工标准', text: '不改一个字', verified: true, relationVerified: false, relationDetails: '' };
afterEach(() => vi.unstubAllGlobals());
it('old notes have the AI lock off by default', async () => {
  fixture(undefined);
  expect((await readNoteById('6856')).aiLocked).toBe(false);
});
it('AI cannot change a locked note or switch its lock off', async () => {
  const writes = fixture('true');
  await expect(updatePlainNote('6856', { ...edit, text: '替换', aiLocked: false }, undefined, 'ai')).rejects.toThrow('严禁 AI 编辑');
  expect(writes).toEqual([]);
});
it('human Save persists the lock and keeps the original text unchanged', async () => {
  const writes = fixture('false');
  await updatePlainNote('6856', { ...edit, aiLocked: true });
  expect(writes[0]).toMatchObject({ a66: 'true', a55: '人工标准', a56: '不改一个字' });
  expect((await readNoteById('6856')).aiLocked).toBe(true);
});
it('human edits remain possible while the AI lock is enabled', async () => {
  fixture('true');
  await updatePlainNote('6856', { ...edit, text: '用户亲自修改' });
  expect(await readNoteById('6856')).toMatchObject({ text: '用户亲自修改', aiLocked: true });
});