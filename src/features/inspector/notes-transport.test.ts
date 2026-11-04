import { expect, it } from 'vitest';
import { encodeNotes, decodeNotes } from './notes-transport';

it('round-trips all 6519 Chinese notes and associations in a bounded scalar', async () => {
  const notes = Array.from({ length: 6519 }, (_, i) => ({ key: `element|${i}`, id: `${i + 1}`, title: `注释${i}`, text: '真实来源、数据链、判定、计算。'.repeat(160), locked: true, updatedAt: '2026-11-04T08:00:00Z' }));
  const encoded = await encodeNotes(notes);
  expect(encoded.length).toBeLessThan(1_000_000);
  expect(await decodeNotes(encoded)).toEqual(notes);
});

it('rejects corrupted compressed data instead of presenting an empty catalogue', async () => {
  await expect(decodeNotes(btoa('not gzip'))).rejects.toThrow();
});