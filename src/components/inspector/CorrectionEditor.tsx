import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitNoteCorrection } from '@/lib/inspector-notes.functions';
import { chatAboutCorrection } from '@/lib/inspector-ai.functions';
import { inspectorNotesCache } from '@/features/inspector/notes-cache';
import { getWPToken } from '@/services/wp-auth';
import type { Correction, ReportNote } from '@/features/inspector/conflict-report';

const labels = { page_note: '整页笔记', element_note: '元素笔记', functional_note: '当前功能逻辑笔记', code: '页面逻辑代码' };
type Msg = { role: 'user' | 'assistant'; content: string; title?: string; text?: string };
export function CorrectionEditor({ suggestion, original, onSaved }: { suggestion: Correction; original?: ReportNote | undefined; onSaved?: (note: ReportNote) => void }) {
  const submit = submitNoteCorrection;
  const [title, setTitle] = useState(suggestion.title);
  const [text, setText] = useState(suggestion.text);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const code = suggestion.target === 'code';
  const chat = chatAboutCorrection;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [ask, setAsk] = useState('');
  const [thinking, setThinking] = useState(false);
  const [chatError, setChatError] = useState('');
  const send = async () => {
    const q = ask.trim(); if (!q || thinking) return;
    const next: Msg[] = [...messages, { role: 'user', content: q }];
    setMessages(next); setAsk(''); setThinking(true); setChatError('');
    try {
      const r = await chat({ data: { page: window.location.pathname + window.location.search, target: suggestion.target, noteId: suggestion.noteId, basisNoteIds: suggestion.basisNoteIds.filter(id => /^\d+$/.test(id)), reason: suggestion.reason, draftTitle: title, draftText: text, messages: next.map(m => ({ role: m.role, content: m.role === 'assistant' && m.text ? `${m.content}\n\n[给出的完整内容]\n${m.text}` : m.content })) } });
      if (!('reply' in r) || !r.reply) throw new Error(('error' in r && r.error) || 'AI 没有回复。');
      setMessages([...next, { role: 'assistant', content: r.reply, ...(r.title ? { title: r.title } : {}), ...(r.text ? { text: r.text } : {}) }]);
    } catch (e) { setChatError(e instanceof Error ? e.message : '对话失败。'); }
    finally { setThinking(false); }
  };
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
    <p className="font-semibold">建议修改或补充 · {labels[suggestion.target]}{original ? ` · CCT324 #${original.id} · ${original.title}` : ''}</p>
    <p>{suggestion.reason}</p>
    <p className="text-muted-foreground">功能逻辑基准：{suggestion.basisNoteIds.map(id => `#${id}`).join('、') || '尚未确认'}</p>
    {!code && <details><summary>查看修改前的完整笔记</summary><p className="whitespace-pre-wrap">{original?.text || '缺少原笔记，不能提交'}</p></details>}
    {!code && <Input aria-label="建议修改或补充标题" value={title} maxLength={240} disabled={busy || saved} onChange={e => { setTitle(e.target.value); setConfirm(false); }} />}
    <Textarea aria-label={code ? '页面逻辑建议修改或补充' : '建议修改或补充完整正文'} rows={10} value={text} disabled={busy || saved} onChange={e => { setText(e.target.value); setConfirm(false); }} />
    {code ? <><p>仅供手动修改页面逻辑；不会写入笔记，也不会自动执行代码。</p><Button size="sm" variant="outline" onClick={() => { const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = '页面逻辑建议修改或补充.txt'; a.click(); URL.revokeObjectURL(url); }}>下载</Button><Button size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(text)}>复制</Button></> : <>
      {original?.verified && <p className="text-destructive">这条笔记已手动核对。只有你明确确认后才会修改，核对状态保持不变。</p>}
      {!confirm && !saved && <Button size="sm" variant="outline" disabled={!original || !title.trim() || !text.trim() || busy} onClick={() => setConfirm(true)}>提交修改到 #{original?.id}</Button>}
      {confirm && <div className="space-y-2"><p>确认用上面完整正文替换 CCT324 #{original?.id} 的名字和正文？不改变关联及核对状态。</p><div className="flex flex-wrap gap-2"><Button size="sm" disabled={busy} onClick={save}>{busy ? '提交中…' : '确认提交修改'}</Button><Button size="sm" variant="ghost" disabled={busy} onClick={() => setConfirm(false)}>取消</Button></div></div>}
      {saved && <p role="status">已保存到 CCT324 #{original?.id} 并读回核验；旧分析已过时，请重新分析。</p>}
    </>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
    <div className="space-y-2 rounded-md border border-border bg-muted/30 p-2" aria-label="和 AI 讨论这条建议">
      <p className="font-semibold">和 AI 讨论这条建议</p>
      <p className="text-muted-foreground">关联注释视为正确，只改当前{code ? '页面代码' : '注释'}。AI 的回复不会自动保存。</p>
      {messages.map((m, k) => <div key={k} className={m.role === 'user' ? 'ml-6 rounded-md bg-primary p-2 text-primary-foreground whitespace-pre-wrap' : 'whitespace-pre-wrap'}>
        <p>{m.content}</p>
        {m.role === 'assistant' && m.text && <div className="mt-1 space-y-1">
          <pre className="max-h-60 overflow-auto rounded bg-background p-2 text-[11px] whitespace-pre-wrap">{m.text}</pre>
          <div className="flex flex-wrap gap-2">
            {!saved && <Button size="sm" variant="outline" onClick={() => { setText(m.text || ''); if (m.title && !code) setTitle(m.title); setConfirm(false); }}>放进上面的编辑框</Button>}
            <Button size="sm" variant="ghost" onClick={() => navigator.clipboard?.writeText(m.text || '')}>复制</Button>
          </div>
        </div>}
      </div>)}
      {thinking && <p className="text-muted-foreground">AI 正在回复…</p>}
      {chatError && <p role="alert" className="text-destructive">{chatError}</p>}
      <Textarea aria-label="对 AI 说" rows={2} value={ask} placeholder="例如：再补上推送写入的 CCT 和 Column；或给我可以复制的代码修改" disabled={thinking} onChange={e => setAsk(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void send(); } }} />
      <Button size="sm" disabled={!ask.trim() || thinking} onClick={() => void send()}>{thinking ? '回复中…' : '发送'}</Button>
    </div>
  </div>;
}