import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ analyze: vi.fn(), save: vi.fn() }));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock('@/lib/inspector-ai.functions', () => ({ explainReadWrite: mocks.analyze }));
vi.mock('@/lib/inspector-notes.functions', () => ({ loadAllInspectorNotes: vi.fn(), loadInspectorNotes: vi.fn(), saveInspectorNote: mocks.save, selectInspectorNote: vi.fn() }));
vi.mock('@/services/wp-auth', () => ({ getWPToken: () => 'test-session' }));
vi.mock('@/features/inspector/notes-cache', () => ({ inspectorNotesCache: { peek: () => new Map([['page|/care-circle', { key:'page|/care-circle', id:'1', title:'群组逻辑', text:'已保存的说明', locked:true, verified:true, updatedAt:'2026-11-06' }]]) } }));
vi.mock('./RelatedNotes', () => ({ RelatedNotes: () => null }));
import { ManualNotes } from './ManualNotes';

afterEach(() => { cleanup(); vi.clearAllMocks(); });
it('compares the current unsaved draft with code and does not save or change verification', async () => {
  mocks.analyze.mockResolvedValue({ report: { summary:'发现来源疑点', comparedNoteIds:['1','2'],comparedCodeNoteIds:['1','2'],comparedPairs:[['1','2']],codeCompared:true,findings:[{kind:'suspicion',title:'来源疑点',noteIds:['1','2'],evidence:'双方表号不一致',verdict:'需核查',fix:'核对数据字典'}] } });
  render(<ManualNotes noteKey="page|/care-circle" scope="page" page="/care-circle" label="群组" evidenceReady buildEvidence={() => '{"codeRefs":[{"snippet":"read CCT202"}]}' } />);
  await waitFor(() => expect(screen.getByDisplayValue('已保存的说明')).toBeDefined());
  fireEvent.change(screen.getByDisplayValue('已保存的说明'), { target: { value:'我正在编辑的说明' } });
  fireEvent.click(screen.getByRole('button', { name:'AI 分析：注释、关联注释与实际读写' }));
  await waitFor(() => expect(screen.getByRole('alert')).toBeDefined());
  expect(mocks.analyze).toHaveBeenCalledWith({ data: { context:'{"codeRefs":[{"snippet":"read CCT202"}]}',scope:'page',noteId:'1',draft:{title:'群组逻辑',text:'我正在编辑的说明'} } });
  expect(mocks.save).not.toHaveBeenCalled();
  expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
  fireEvent.change(screen.getByDisplayValue('我正在编辑的说明'), { target:{value:'再次修改'} });
  expect(screen.queryByRole('alert')).toBeNull();
});