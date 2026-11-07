import { useRef, useState } from 'react';
import { Download, Globe, Square, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadAllInspectorNotes } from '@/lib/inspector-notes.functions';
import { analyzeSiteNote } from '@/lib/inspector-ai.functions';
import { decodeNotes } from '@/features/inspector/notes-transport';
import { discoverSitePages, buildSiteEvidence } from '@/features/inspector/site-evidence';
import { siteTotals, siteMarkdownReport, type SitePage, type SiteResult } from '@/features/inspector/site-analysis';
import { ConflictReportView } from './ConflictReportView';
import { readSource } from '@/features/inspector/live-index';

interface Work { page: string; noteId?: string; pageNoteIds?: string[]; evidence: string; chunk: number; chunks: number; omissions: string[] }
export function SiteAnalysis() {
  const load = loadAllInspectorNotes; const analyze = analyzeSiteNote;
  const [pages, setPages] = useState<SitePage[]>([]); const [results, setResults] = useState<SiteResult[]>([]);
  const [phase, setPhase] = useState(''); const [running, setRunning] = useState(false); const [error, setError] = useState('');
  const [expected, setExpected] = useState(0); const stop = useRef(false); const work = useRef<Work[]>([]); const cursor = useRef(0);
  const totals = siteTotals(pages, results, expected);
  const process = async () => {
    for (; cursor.current < work.current.length; cursor.current++) {
      if (stop.current) break;
      const task = work.current[cursor.current]; if (!task) break;
      setPhase(`${task.page} · ${task.noteId ? `注释 #${task.noteId}` : '没有绑定注释'} · 代码 ${task.chunk}/${task.chunks}`);
      if (!task.noteId) {
        setResults(previous => [...previous, { page: task.page, chunk: 1, chunks: 1, report: { summary: '此页面没有绑定的整页或元素注释，不能比对。', comparedNoteIds: [], comparedCodeNoteIds: [], comparedPairs: [], codeCompared: false, findings: [{ kind: 'missing_evidence', title: '缺少页面注释', noteIds: [], evidence: task.page, verdict: '未完成核查', fix: '为页面及可见动态读写元素绑定注释后重新分析。' }] } }]);
        continue;
      }
      let result: { report?: SiteResult['report']; error?: string };
      try { result = await analyze({ data: { ...task, noteId: task.noteId } }); }
      catch (e) { result = { error: e instanceof Error ? e.message : String(e) }; }
      setResults(previous => [...previous, { page: task.page, noteId: task.noteId, chunk: task.chunk, chunks: task.chunks, ...result }]);
      if (result.error) { cursor.current++; setError(`${result.error}；已暂停，失败项不会自动重发。`); break; }
    }
  };
  const run = async (resume = false) => {
    stop.current = false; setRunning(true); setError('');
    try {
      if (!resume) {
        setResults([]); work.current = []; cursor.current = 0; setExpected(0); setPhase('读取全站页面和最新保存注释…');
        const response = await load({ data: undefined });
        if (response.error) throw new Error(response.error);
        const bindings = response.compressedNotes ? await decodeNotes(response.compressedNotes) : response.notes || [];
        const inventory = await discoverSitePages(bindings); setPages(inventory);
        const sourceReads = new Map<string, Promise<string | null>>();
        const readForRun = (file: string) => {
          const existing = sourceReads.get(file); if (existing) return existing;
          const pending = readSource(file); sourceReads.set(file, pending); return pending;
        };
        for (const page of inventory) {
          if (stop.current) { work.current = []; throw new Error('清单准备已停止；尚未执行 AI，可重新开始。'); }
          setPhase(`读取当前代码：${page.path}`);
          const evidence = await buildSiteEvidence(page, readForRun);
          if (!page.noteIds.length) work.current.push({ page: page.path, evidence: '', chunk: 1, chunks: 1, omissions: evidence.omissions });
          else for (const noteId of page.noteIds) for (const [index, text] of (evidence.chunks.length ? evidence.chunks : ['无代码证据']).entries()) {
            work.current.push({ page: page.path, noteId, pageNoteIds: page.pageNoteIds || [], evidence: text, chunk: index + 1, chunks: Math.max(1, evidence.chunks.length), omissions: [...evidence.omissions, ...(evidence.chunks.length > 1 ? [`当前只提供 ${index + 1}/${evidence.chunks.length} 代码分片；单项不代表整页核查完成。`] : [])] });
          }
        }
        setExpected(work.current.length);
      }
      await process();
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setRunning(false); setPhase(stop.current ? '已停止；已返回结果保留' : '本轮处理已结束'); }
  };
  const download = () => {
    const payload = siteMarkdownReport(pages, results, expected);
    const url = URL.createObjectURL(new Blob([payload], { type: 'text/markdown;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = '全站读写冲突报告.md'; a.click(); URL.revokeObjectURL(url);
  };
  return <section className="space-y-3 text-xs">
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={() => void run()} disabled={running}><Globe className="mr-1 h-4 w-4" />一键全站 AI 分析</Button>
      {running && <Button size="sm" variant="outline" onClick={() => { stop.current = true; setPhase('停止排队中；当前分析返回后停止'); }}><Square className="mr-1 h-4 w-4" />停止</Button>}
      {!running && cursor.current < work.current.length && <Button size="sm" variant="outline" onClick={() => void run(true)}><Play className="mr-1 h-4 w-4" />继续未分析项</Button>}
      {results.length > 0 && <Button size="sm" variant="outline" onClick={download}><Download className="mr-1 h-4 w-4" />下载报告</Button>}
    </div>
    <p>全站 {totals.pages} 个页面范围；已返回 {totals.processed}/{totals.expected} 项，成功返回 {totals.completed} 项，失败 {totals.failures} 项，冲突或疑点 {totals.findings} 项。</p>
    {expected > 0 && <p className={totals.complete ? 'text-foreground' : 'text-destructive'}>证据完整的注释 {totals.completeNotes}/{totals.boundNotes}；{totals.complete ? '本次静态核查范围已完成' : '未完成，不能认定全站一致'}。</p>}
    <p role="status">{phase}</p>
    {error && <p role="alert" className="text-destructive">{error}</p>}
    <p className="text-muted-foreground">范围：全部页面代码、已绑定整页／元素注释及各自直接关联注释。未绑定页面、缺失代码和未实测状态列为未完成；无关联注释不作任意两两比较。逐项分析会产生 AI 费用。</p>
    {pages.map(page => <details key={page.path} className="border-b border-border pb-2">
      <summary className={`cursor-pointer break-words ${results.some(r => r.page === page.path && (r.error || r.report?.findings.length)) ? 'text-destructive' : ''}`}>{page.path} · 整页绑定 {page.pageNotes} · 元素绑定 {page.elementNotes} · 已返回 {results.filter(r => r.page === page.path).length} 项 · 冲突或疑点 {results.filter(r => r.page === page.path).reduce((sum, r) => sum + (r.report?.findings.length || (r.error ? 1 : 0)), 0)}</summary>
      <div className="mt-2 space-y-2">{results.filter(r => r.page === page.path).map((result, index) => <div key={index}>
        <p>注释 {result.noteId ? `#${result.noteId}` : '未绑定'} · 代码分片 {result.chunk}/{result.chunks}</p>
        {result.error && <p role="alert" className="text-destructive">{result.error}</p>}
        {result.report && <ConflictReportView report={result.report} />}
      </div>)}</div>
    </details>)}
  </section>;
}