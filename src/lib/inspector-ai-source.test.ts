import { afterEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ verify: vi.fn(), explain: vi.fn(), source: vi.fn(), note: vi.fn(), related: vi.fn() }));
vi.mock('@tanstack/react-start', () => ({ createServerFn: () => ({ inputValidator: () => ({ handler: (fn: unknown) => fn }) }) }));
vi.mock('@tanstack/react-start/server', () => ({ getRequestHeader: () => 'test-session' }));
vi.mock('./inspector-ai.server', () => ({ verifyResearcher: mocks.verify, explainInspection: mocks.explain }));
vi.mock('./inspector-source.server', () => ({ readInspectionSource: mocks.source }));
vi.mock('./inspector-notes.server', () => ({ readCCTNoteForKey: mocks.note, readNoteById: mocks.note, readRelatedNotes: mocks.related }));
import { explainReadWrite } from './inspector-ai.functions';
const invoke = () => (explainReadWrite as unknown as (args: { data: { context: string; noteKeys: string[] } }) => Promise<{ error?: string }>)({ data: { context: JSON.stringify({ page: '/cared-ones/46/medicine', files: [], codeRefs: [] }), noteKeys: ['page|/cared-ones/46/medicine'] } });
afterEach(() => vi.resetAllMocks());
it('supplies server-read actual code plus functional and manual notes even when the browser has no source tags', async () => {
  mocks.note.mockResolvedValue({ id: '6126', title: '用药整页', text: 'manual note', verified: true });
  mocks.related.mockResolvedValue([{ id: '6859', title: '用药功能逻辑', text: 'functional baseline', verified: true }]);
  mocks.source.mockResolvedValue({ files: [{ file: 'features/medicine/source.medicine.ts', text: 'const REL_SCHEDULE_LOG = R.medicineScheduleLogs;' }], omissions: [] });
  mocks.explain.mockResolvedValue({ error: 'mock response' });
  await invoke();
  expect(mocks.verify).toHaveBeenCalledWith('test-session');
  expect(mocks.source).toHaveBeenCalledWith({ page: '/cared-ones/46/medicine' });
  const context = mocks.explain.mock.calls[0]?.[0];
  expect(context).toContain('features/medicine/source.medicine.ts:1 const REL_SCHEDULE_LOG = R.medicineScheduleLogs;');
  expect(context).toContain('functional baseline');
  expect(context).toContain('manual note');
});
it('never calls AI for a notes-only comparison when actual source is missing', async () => {
  mocks.note.mockResolvedValue(null); mocks.related.mockResolvedValue([]);
  mocks.source.mockResolvedValue({ files: [], omissions: ['没有实际源代码，三方核对未执行。'] });
  expect((await invoke()).error).toContain('三方核对未执行');
  expect(mocks.explain).not.toHaveBeenCalled();
});