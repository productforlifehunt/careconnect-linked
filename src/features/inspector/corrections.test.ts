import { expect, it } from 'vitest';
import { assertUnchangedNote, attachCorrectionNotes } from './corrections';
import { validateConflictReport } from './conflict-report';

const note = { id: '6855', title: '信息卡片功能逻辑', text: '原正文', verified: true, role: 'functional_note' as const };
it('refuses to overwrite a note changed after analysis', () => {
  expect(() => assertUnchangedNote({ ...note, text: '新手动修改' }, note)).toThrow('分析后已改变');
  expect(() => assertUnchangedNote({ ...note, verified: false }, note)).toThrow('分析后已改变');
  expect(() => assertUnchangedNote(note, note)).not.toThrow();
});
it('rejects model-invented note targets and code writes to a note', () => {
  const base = { summary:'核对', comparedNoteIds:['6855'],comparedPairs:[],comparedCodeNoteIds:['6855'],codeCompared:true };
  const suggestion = { target:'functional_note',noteId:'99999',basisNoteIds:['6855'],reason:'冲突',title:'功能逻辑',text:'完整正文' };
  const finding = {kind:'conflict',title:'冲突',noteIds:['6855'],evidence:'双方证据',verdict:'待确认',fix:'手动改',suggestions:[suggestion]};
  const a = validateConflictReport(JSON.stringify({...base,findings:[finding]}),['6855'],true);
  expect(a.findings[0]?.suggestions).toEqual([]);
  expect(a.findings.some(f => f.evidence.includes('目标不是本次核查的笔记'))).toBe(true);
  const b = validateConflictReport(JSON.stringify({...base,findings:[{...finding,suggestions:[{...suggestion,target:'code',noteId:'6855'}]}]}),['6855'],true);
  expect(b.findings.some(f => f.evidence.includes('代码建议指向了笔记'))).toBe(true);
});
it('accepts numeric and "#id" note ids from the model', () => {
  const r = validateConflictReport(JSON.stringify({summary:'s',comparedNoteIds:[6855,'#6858'],comparedPairs:[['CCT324 #6855',6858]],comparedCodeNoteIds:['6855','6858'],codeCompared:true,findings:[]}),['6855','6858'],true);
  expect(r.findings).toEqual([]);
});
it('uses server-read originals and disallows changing functional notes as element notes', () => {
  const report = { summary:'核对', comparedNoteIds:['6855'],comparedPairs:[],comparedCodeNoteIds:['6855'],codeCompared:true,findings:[{kind:'conflict' as const,title:'冲突',noteIds:['6855'],evidence:'证据',verdict:'待确认',fix:'手动改',suggestions:[{target:'element_note' as const,noteId:'6855',basisNoteIds:['6855'],reason:'理由',title:'标题',text:'完整正文'}]}] };
  const result = attachCorrectionNotes(report,[note]);
  expect(result.findings[0]?.suggestions).toEqual([]);
  expect(result.notes).toEqual([{ ...note, current: false }]);
});
it('never targets a related note; only the current page/element note may be changed', () => {
  const report = { summary:'核对', comparedNoteIds:['1','2'],comparedPairs:[],comparedCodeNoteIds:['1','2'],codeCompared:true,findings:[{kind:'conflict' as const,title:'冲突',noteIds:['1','2'],evidence:'证据',verdict:'待确认',fix:'手动改',suggestions:[
    {target:'functional_note' as const,noteId:'2',basisNoteIds:['2'],reason:'理由',title:'功能逻辑',text:'改关联'},
    {target:'element_note' as const,noteId:'1',basisNoteIds:['2'],reason:'理由',title:'元素',text:'改当前'}]}] };
  const notes = [{ id:'1', title:'元素', text:'x', verified:false, role:'element_note' as const, current:true }, { id:'2', title:'功能逻辑', text:'y', verified:true, role:'functional_note' as const }];
  expect(attachCorrectionNotes(report, notes).findings[0]?.suggestions?.map(s => s.noteId)).toEqual(['1']);
});
it('keeps a locked current note as a baseline and accepts only the code correction', () => {
  const suggestion = { target: 'functional_note' as const, noteId: '6855', basisNoteIds: ['6855'], reason: '冲突', title: '不能替换', text: '不能写入' };
  const code = { ...suggestion, target: 'code' as const, noteId: null, text: '修改代码' };
  const result = attachCorrectionNotes({ summary: '核查', comparedNoteIds: ['6855'], comparedPairs: [], comparedCodeNoteIds: ['6855'], codeCompared: true, findings: [{ kind: 'conflict', title: '冲突', noteIds: ['6855'], evidence: '证据', verdict: '按标准', fix: '改代码', suggestions: [suggestion, code] }] }, [{ ...note, aiLocked: true, current: true }]);
  expect(result.findings[0]?.suggestions).toEqual([code]);
});