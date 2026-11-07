var e=`import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ConflictReport } from '@/features/inspector/conflict-report';
import { CorrectionEditor } from './CorrectionEditor';

export function ConflictReportView({ report }: { report: ConflictReport }) {
  const bad = report.findings.length > 0;
  return <div role={bad ? 'alert' : 'status'} className={\`space-y-2 rounded-md border p-2 text-xs \${bad ? 'border-destructive bg-destructive/5 text-destructive' : 'border-border bg-muted/40'}\`}>
    <div className="flex items-center gap-1 font-semibold">{bad ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{bad ? \`发现 \${report.findings.length} 项冲突或疑点\` : '本次证据范围内未发现冲突'}</div>
    <p>{report.summary}</p>
    <p>比对注释：{report.comparedNoteIds.map(id => \`#\${id}\`).join('、') || '无'}；注释逐对比对：{report.comparedPairs.length} 组；代码比对：{report.codeCompared ? '已执行' : '未完成'}</p>
    {report.findings.map((finding, i) => <div key={i} className="space-y-1 border-t border-destructive/30 pt-2 whitespace-pre-wrap break-words">
      <p className="font-semibold">{i + 1}. {finding.title}</p>
      {finding.noteIds.length > 0 && <p>涉及注释：{finding.noteIds.map(id => \`#\${id}\`).join('、')}</p>}
      <p>证据：{finding.evidence}</p><p>判定：{finding.verdict}</p><p>建议修改或补充：{finding.fix}</p>
      {finding.suggestions?.map((suggestion, j) => <CorrectionEditor key={\`\${i}-\${j}\`} suggestion={suggestion} original={report.notes?.find(note => note.id === suggestion.noteId)} />)}
    </div>)}
  </div>;
}`;export{e as default};