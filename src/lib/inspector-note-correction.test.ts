import { afterEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ verify:vi.fn(), read:vi.fn(), update:vi.fn() }));
vi.mock('@tanstack/react-start', () => ({ createServerFn:() => ({ handler:(fn:unknown) => fn, inputValidator:() => ({ handler:(fn:unknown) => fn }) }) }));
vi.mock('@tanstack/react-start/server', () => ({ getRequestHeader:() => 'test-session' }));
vi.mock('./inspector-ai.server', () => ({ verifyResearcher:mocks.verify }));
vi.mock('./inspector-notes.server', () => ({ readNoteById:mocks.read,updatePlainNote:mocks.update }));
import { submitNoteCorrection } from './inspector-notes.functions';
const current = {id:'6855',title:'功能逻辑',text:'原正文',verified:true};
const data = {id:'6855',title:'修改标题',text:'修改后的完整正文',expected:{title:current.title,text:current.text,verified:true},confirmVerified:true};
// The mock builder exposes the handler for testing its actual authentication and write boundary.
async function invoke(input = data) { return (submitNoteCorrection as unknown as (args:{data:typeof data}) => Promise<{error?:string;note?:typeof current}>)({data:input}); }
afterEach(() => vi.resetAllMocks());
it('verifies researcher then saves only the exact existing record and preserves its manual-check flag', async () => {
  mocks.read.mockResolvedValueOnce(current).mockResolvedValueOnce({...current,title:data.title,text:data.text});
  const result = await invoke();
  expect(mocks.verify).toHaveBeenCalledWith('test-session');
  expect(mocks.update).toHaveBeenCalledExactlyOnceWith('6855','修改标题','修改后的完整正文',true);
  expect(mocks.read.mock.calls).toEqual([['6855'],['6855']]);
  expect(result.note?.text).toBe('修改后的完整正文');
});
it('never writes after auth denial', async () => {
  mocks.verify.mockRejectedValue(new Error('只有研究员可以使用'));
  expect((await invoke()).error).toContain('研究员');
  expect(mocks.read).not.toHaveBeenCalled();
  expect(mocks.update).not.toHaveBeenCalled();
});
it('never writes over stale content or verified notes without explicit confirmation', async () => {
  mocks.read.mockResolvedValue({...current,text:'新修改'});
  expect((await invoke()).error).toContain('分析后已改变');
  expect(mocks.update).not.toHaveBeenCalled();
  mocks.read.mockResolvedValue(current);
  expect((await invoke({...data,confirmVerified:false})).error).toContain('明确确认');
  expect(mocks.update).not.toHaveBeenCalled();
});