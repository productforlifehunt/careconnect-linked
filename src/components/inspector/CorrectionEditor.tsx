import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitNoteCorrection } from '@/lib/inspector-notes.functions';
import { inspectorNotesCache } from '@/features/inspector/notes-cache';
import { getWPToken } from '@/services/wp-auth';
import type { Correction, ReportNote } from '@/features/inspector/conflict-report';

const labels = { page_note: '整页笔记', element_note: '元素笔记', functional_note: '功能逻辑笔记', code: '页面逻辑代码' };
export function CorrectionEditor({ suggestion, original, onSaved }: { suggestion: Correction; original?: ReportNote | undefined; onSaved?: (note: ReportNote) => void }) {
  const submit = useServerFn(submitNoteCorrection);
  const [title, setTitle] = useState(suggestion.title);
  const [text, setText] = useState(suggestion.text);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const code = suggestion.target === 'code';
  const save = async () => {
    if (code || !original || !suggestion.noteId || busy) return;
    const session = getWPToken() || '';
    setBusy(true); setError('');
    try {
      const result = await submit({ data: { id: original.id, title, text, expected: { title: original.title, text: original.text, verified: original.verified }, confirmVerified: confirm } });
      if (session !== (getWPToken() || '')) throw new Error('登录状态已变化，请重新读取笔记。');
      if (!result.note) throw new Error(result.error || '未确认保存。');
      const note = { ...original, ...result.note };
      inspectorNotesCache.put(session, { ...note, key: `cct|${note.id}`, updatedAt: new Date().toISOString() });
      onSaved?.(note);
      window.dispatchEvent(new CustomEvent('inspector-note-corrected', { detail: note }));
      setSaved(true); setConfirm(false);
    } catch (e) { setError(e instanceof Error ? e.message : '保存失败。'); }
    finally { setBusy(false); }
  };
  return <div className="space-y-2 border-t border-border pt-2 text-foreground">
    <p className="font-semibold">修改建议 · {labels[suggestion.target]}{original ? ` · CCT324 #${original.id} · ${original.title}` : ''}</p>
    <p>{suggestion.reason}</p>
    <p className="text-muted-foreground">功能逻辑基准：{suggestion.basisNoteIds.map(id => `#${id}`).join('、') || '尚未确认'}</p>
    {!code && <details><summary>查看修改前的完整笔记</summary><p className="whitespace-pre-wrap">{original?.text || '缺少原笔记，不能提交'}</p></details>}
    {!code && <Input aria-label="修改建议标题" value={title} maxLength={240} disabled={busy || saved} onChange={e => { setTitle(e.target.value); setConfirm(false); }} />}
    <Textarea aria-label={code ? '页面逻辑修改方案' : '修改建议完整正文'} rows={10} value={text} disabled={busy || saved} onChange={e => { setText(e.target.value); setConfirm(false); }} />
    {code ? <><p>仅供手动修改页面逻辑；不会写入笔记，也不会自动执行代码。</p><Button size="sm" variant="outline" onClick={() => { const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = '页面逻辑修改方案.txt'; a.click(); URL.revokeObjectURL(url); }}>下载修改方案</Button></> : <>
      {original?.verified && <p className="text-destructive">这条笔记已手动核对。只有你明确确认后才会修改，核对状态保持不变。</p>}
      {!confirm && !saved && <Button size="sm" variant="outline" disabled={!original || !title.trim() || !text.trim() || busy} onClick={() => setConfirm(true)}>提交修改到 #{original?.id}</Button>}
      {confirm && <div className="space-y-2"><p>确认用上面完整正文替换 CCT324 #{original?.id} 的名字和正文？不改变关联及核对状态。</p><div className="flex flex-wrap gap-2"><Button size="sm" disabled={busy} onClick={save}>{busy ? '提交中…' : '确认提交修改'}</Button><Button size="sm" variant="ghost" disabled={busy} onClick={() => setConfirm(false)}>取消</Button></div></div>}
      {saved && <p role="status">已保存到 CCT324 #{original?.id} 并读回核验；旧分析已过时，请重新分析。</p>}
    </>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
  </div>;
}