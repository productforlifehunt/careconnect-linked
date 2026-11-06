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
  expect(() => validateConflictReport(JSON.stringify({...base,findings:[finding]}),['6855'],true)).toThrow('建议目标');
  expect(() => validateConflictReport(JSON.stringify({...base,findings:[{...finding,suggestions:[{...suggestion,target:'code',noteId:'6855'}]}]}),['6855'],true)).toThrow('代码建议');
});
it('uses server-read originals and disallows changing functional notes as element notes', () => {
  const report = { summary:'核对', comparedNoteIds:['6855'],comparedPairs:[],comparedCodeNoteIds:['6855'],codeCompared:true,findings:[{kind:'conflict' as const,title:'冲突',noteIds:['6855'],evidence:'证据',verdict:'待确认',fix:'手动改',suggestions:[{target:'element_note' as const,noteId:'6855',basisNoteIds:['6855'],reason:'理由',title:'标题',text:'完整正文'}]}] };
  const result = attachCorrectionNotes(report,[note]);
  expect(result.findings[0]?.suggestions).toEqual([]);
  expect(result.notes).toEqual([note]);
});