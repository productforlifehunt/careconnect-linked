import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { ConflictReportView } from './ConflictReportView';

afterEach(cleanup);
it('shows a single suspicion as an alert rather than a clean report', () => {
  render(<ConflictReportView report={{ summary: '疑似来源冲突', comparedNoteIds: ['1','2'], comparedPairs: [['1','2']], codeCompared: true, findings: [{ kind:'suspicion',title:'用途未确认',noteIds:['1'],evidence:'普通讨论与祝福的用途需分清',verdict:'不能判断相同用途',fix:'核对实际栏目' }] }} />);
  expect(screen.getByRole('alert')).toBeDefined();
});
it('reports a complete zero-finding check without an alert', () => {
  render(<ConflictReportView report={{ summary:'本次已检查',comparedNoteIds:['1'],comparedPairs:[],codeCompared:true,findings:[] }} />);
  expect(screen.getByRole('status')).toBeDefined();
  expect(screen.queryByRole('alert')).toBeNull();
});