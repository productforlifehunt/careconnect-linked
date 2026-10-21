import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Archive, ChevronDown, Download, Loader2, Pause, Play, Plus, Save, Square, Link2, Trash2, Upload, Pencil, X } from "lucide-react";
import {
  listRecordings, uploadRecording, generateTranscript, playUrl, displayName, saveMeta, deleteRecording, replaceRecording,
  loadTranscriptArchive, saveTranscriptArchive, saveTextArchive, anonymizeLines,
  type ArchiveKind, type Recording, type Line, type Meta, type TranscriptArchive,
} from "@/features/interviews/transcribe";
import { archiveToText, downloadText } from "@/features/interviews/archive-text";
import { wpLogin, wpEnsureFreshToken } from "@/services/wp-auth";
import { compareResearchTitles } from "@/features/interviews/research-order";
import { ResearchCodeLegend } from "@/components/esm/ResearchCodeLegend";

const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;
const titleOf = (r: Recording) => r.meta?.title || displayName(r.path);
const interviewOrder = (a: Recording, b: Recording) => compareResearchTitles(titleOf(a), titleOf(b)) || a.path.localeCompare(b.path);

/**
 * Interview records. Anyone with the page can listen and regenerate transcripts;
 * only the signed-in researcher (`canEdit`) can add recordings and save title/notes/instructions.
 */
export default function InterviewsPanel({ canEdit }: { canEdit: boolean }) {
  const [items, setItems] = useState<Recording[] | null>(null);
  const [selected, setSelected] = useState<string>(() => new URL(window.location.href).searchParams.get("rec") || "");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => listRecordings().then((d) => {
    const ordered = [...d].sort(interviewOrder);
    setItems(ordered);
    setSelected((s) => (s && ordered.some((r) => r.path === s) ? s : ordered[0]?.path || ""));
  }).catch((e) => setError(e.message));
  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    if (!selected) return;
    const url = new URL(window.location.href);
    url.searchParams.set("rec", selected);
    window.history.replaceState({}, "", url.toString());
  }, [selected]);

  const onFile = async (file?: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("audio/") && !/\.(mp3|m4a|wav|aac|ogg|flac|webm)$/i.test(file.name)) { setError("Please choose an audio file. / 请选择音频文件"); return; }
    if (file.size > 500 * 1024 * 1024) { setError("Recordings up to 500 MB are supported. / 最大 500 MB"); return; }
    setError(""); setUploading(true);
    try {
      const path = await uploadRecording(file);
      await saveMeta(path, { title: file.name.replace(/\.[^.]+$/, ""), recruitmentSource: "", notes: "", instructions: "" });
      await refresh(); setSelected(path);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const current = items?.find((r) => r.path === selected);

  return (
    <div className="mx-auto grid max-w-5xl gap-4 px-4 py-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <aside className="space-y-2">
        {canEdit && (
          <>
            <input ref={fileRef} type="file" accept="audio/*,.m4a,.mp3,.wav" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            <Button className="w-full" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              {uploading ? "Uploading… / 上传中…" : "New interview / 新建访谈"}
            </Button>
          </>
        )}
        <ResearchCodeLegend />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!items && <p className="text-sm text-muted-foreground">Loading… / 加载中…</p>}
        {items?.length === 0 && <p className="text-sm text-muted-foreground">No recordings yet. / 暂无录音</p>}
        {items?.map((r) => (
          <button key={r.path} onClick={() => setSelected(r.path)}
            className={`w-full rounded-md px-3 py-2 text-left text-sm ${r.path === selected ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}>
             <div className="whitespace-normal break-words font-medium leading-snug">{titleOf(r)}</div>
            <div className="text-xs opacity-80">{mb(r.size)}</div>
          </button>
        ))}
      </aside>
      {current ? <Transcript key={current.path} rec={current} canEdit={canEdit} onSaved={refresh} onDeleted={() => { setSelected(""); refresh(); }} /> : null}
    </div>
  );
}

function Transcript({ rec, canEdit, onSaved, onDeleted }: { rec: Recording; canEdit: boolean; onSaved: () => void; onDeleted: () => void }) {
  const path = rec.path;
  // Occasional secondary caregivers did not sign the ethics consent: only the
  // researcher may hear their voice. Transcripts stay visible to everyone.
  const voiceRestricted = /occasional\s+secondary\s+caregiver/i.test(titleOf(rec)) && !canEdit;
  const [audio, setAudio] = useState("");
  // Unsaved edits are kept in this browser so a refresh or sign-in expiry never wipes them.
  const draftKey = `interview-meta-draft:${path}`;
  const [meta, setMetaState] = useState<Meta>(() => {
    try { const d = JSON.parse(localStorage.getItem(draftKey) || "null"); if (d && typeof d === "object") return { ...rec.meta, ...d }; } catch { /* none */ }
    return rec.meta;
  });
  const setMeta = (next: Meta) => { setMetaState(next); localStorage.setItem(draftKey, JSON.stringify(next)); };
  const dirty = meta.title !== rec.meta.title || meta.notes !== rec.meta.notes || meta.instructions !== rec.meta.instructions || (meta.recruitmentSource || "") !== (rec.meta.recruitmentSource || "");
  const retry = useRef<(() => Promise<void>) | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [running, setRunning] = useState(false);
  // True only when the latest run finished every section (not stopped, no error).
  const [complete, setComplete] = useState(false);
  const [needSignIn, setNeedSignIn] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [archive, setArchive] = useState<TranscriptArchive | null>(null);
  const [editedArchive, setEditedArchive] = useState<TranscriptArchive | null>(null);
  const [anonArchive, setAnonArchive] = useState<TranscriptArchive | null>(null);
  const [textArchive, setTextArchive] = useState<TranscriptArchive | null>(null);
  const [anonTextArchive, setAnonTextArchive] = useState<TranscriptArchive | null>(null);
  const [showArchive, setShowArchive] = useState<false | ArchiveKind>(false);
  const [editing, setEditing] = useState(false);
  const [lineKind, setLineKind] = useState<"edited" | "anonymized">("edited");
  const [editLines, setEditLines] = useState<Line[]>([]);
  const [textDraft, setTextDraft] = useState<{ kind: "text" | "anonymized-text"; value: string } | null>(null);
  const [anonProgress, setAnonProgress] = useState("");
  const editedDraftKey = `interview-${lineKind}-draft:${path}`;
  const textDraftKey = (kind: string) => `interview-${kind}-draft:${path}`;
  const busy = editing || !!textDraft || !!anonProgress;
  const archiveOf = (kind: ArchiveKind) => ({ raw: archive, edited: editedArchive, anonymized: anonArchive, text: textArchive, "anonymized-text": anonTextArchive }[kind]);
  const setArchiveOf = (kind: ArchiveKind, value: TranscriptArchive) => ({ raw: setArchive, edited: setEditedArchive, anonymized: setAnonArchive, text: setTextArchive, "anonymized-text": setAnonTextArchive }[kind](value));
  const titleText = meta.title || displayName(path);
  const [showInstructions, setShowInstructions] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [playError, setPlayError] = useState("");
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const abort = useRef<AbortController | null>(null);
  const player = useRef<HTMLAudioElement | null>(null);
  const replaceInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPlayError("");
    setAudio("");
    if (!voiceRestricted) {
      playUrl(path).then(setAudio).catch(() => setPlayError("Could not load this recording. Please refresh. / 录音加载失败，请刷新重试。"));
    }
    loadTranscriptArchive(path).then(setArchive).catch(() => setArchive(null));
    loadTranscriptArchive(path, "edited").then(setEditedArchive).catch((e) => setError(e instanceof Error ? e.message : String(e)));
    loadTranscriptArchive(path, "anonymized").then(setAnonArchive).catch(() => setAnonArchive(null));
    loadTranscriptArchive(path, "text").then(setTextArchive).catch(() => setTextArchive(null));
    loadTranscriptArchive(path, "anonymized-text").then(setAnonTextArchive).catch(() => setAnonTextArchive(null));
    return () => abort.current?.abort();
  }, [path, voiceRestricted]);

  /** Runs a researcher-only action; if the sign-in has expired, asks for the password and retries. */
  const asResearcher = async (action: () => Promise<void>) => {
    await wpEnsureFreshToken();
    try { await action(); setNeedSignIn(false); }
    catch (e) {
      if (!/only the researcher/i.test(String((e as Error)?.message))) throw e;
      retry.current = action;
      setNeedSignIn(true);
      throw new Error("Your researcher sign-in has expired. Enter the password below — nothing you typed or generated is lost. / 研究者登录已过期，请在下方输入密码，已输入和已生成的内容都不会丢失。");
    }
  };

  const save = async () => {
    setSaving(true); setSaved(""); setError("");
    try {
      await asResearcher(async () => {
        const stored = await saveMeta(path, meta);
        localStorage.removeItem(draftKey);
        setMetaState(stored);
        setSaved("Saved / 已保存");
        onSaved();
      });
    }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSaving(false); }
  };

  const generate = async () => {
    if (editing) return;
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    setLines([]); setShowArchive(false); setError(""); setRunning(true); setProgress(null); setComplete(false);
    try {
      await generateTranscript(path, (done, total) => setProgress({ done, total }), (l) => setLines((p) => [...p, ...l]), ctrl.signal);
      if (!ctrl.signal.aborted) setComplete(true);
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") setError(e instanceof Error ? e.message : String(e));
    } finally { setRunning(false); }
  };

  const storeArchive = async () => {
    if (!lines.length || !complete) return;
    if (archive && !window.confirm("A transcript archive already exists. Saving will overwrite it. Confirm? / 已有转录归档，保存将覆盖原有归档，确认覆盖？")) return;
    setSaving(true); setError("");
    try {
      await asResearcher(async () => {
        const savedArchive = await saveTranscriptArchive(path, lines);
        const check = await loadTranscriptArchive(path);
        if (!check || check.lines.length !== savedArchive.lines.length) throw new Error("Archive could not be verified after saving. / 归档保存后校验失败");
        setArchive(check);
        setSaved(`Transcript archive saved (${check.lines.length} sentences) / 转录归档已保存（${check.lines.length} 句）`);
      });
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSaving(false); }
  };

  const startEditing = (kind: "edited" | "anonymized" = "edited") => {
    if (!canEdit || !archive) return;
    let source = kind === "edited" ? editedArchive?.lines || archive.lines : anonArchive?.lines || [];
    try {
      const draft: unknown = JSON.parse(localStorage.getItem(textDraftKey(kind)) || "null");
      if (Array.isArray(draft) && draft.length) source = draft;
    } catch { /* use the saved archive */ }
    if (!source.length) return;
    setLineKind(kind); setEditLines(source.map((line) => ({ ...line })));
    setEditing(true); setShowArchive(kind); setSaved(""); setError("");
  };
  const generateAnonymized = async () => {
    if (!canEdit || !editedArchive?.lines.length) return;
    if (anonArchive && !window.confirm("Generate a new anonymized version from the current Edited archive? The saved anonymized archive only changes when you save. / 用当前修订归档重新生成匿名版本？只有点保存才会覆盖已存的匿名归档。")) return;
    setError(""); setSaved(""); setAnonProgress("0");
    try {
      await asResearcher(async () => {
        const out = await anonymizeLines(editedArchive.lines, (d, t) => setAnonProgress(`${d}/${t}`));
        localStorage.setItem(textDraftKey("anonymized"), JSON.stringify(out));
        setLineKind("anonymized"); setEditLines(out); setEditing(true); setShowArchive("anonymized");
      });
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setAnonProgress(""); }
  };
  const changeLine = (index: number, update: Partial<Line>) => {
    const next = editLines.map((line, i) => i === index ? { ...line, ...update } : line);
    setEditLines(next); localStorage.setItem(editedDraftKey, JSON.stringify(next));
  };
  const storeEditedArchive = async () => {
    if (!canEdit || !editing || !editLines.some((line) => line.zh.trim() || line.en.trim())) return;
    const kind = lineKind;
    const label = kind === "edited" ? "Edited archive / 修订归档" : "Anonymized Edited archive / 匿名修订归档";
    if (archiveOf(kind) && !window.confirm(`Overwrite the existing ${label}? Other archives will not change. / 覆盖现有归档？其他归档不会改变。`)) return;
    setSaving(true); setError("");
    try {
      await asResearcher(async () => {
        const stored = await saveTranscriptArchive(path, editLines, kind);
        const check = await loadTranscriptArchive(path, kind);
        if (!check || JSON.stringify(check.lines) !== JSON.stringify(stored.lines)) throw new Error("Archive could not be verified after saving. / 归档保存后校验失败。");
        setArchiveOf(kind, check); setEditing(false); setShowArchive(kind);
        localStorage.removeItem(textDraftKey(kind));
        setSaved(`${label} saved / 已保存`);
      });
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSaving(false); }
  };
  const startText = (kind: "text" | "anonymized-text", fresh: boolean) => {
    if (!canEdit) return;
    const src = kind === "text" ? editedArchive : anonArchive;
    let value = !fresh && archiveOf(kind)?.text || "";
    if (!fresh && localStorage.getItem(textDraftKey(kind))) value = localStorage.getItem(textDraftKey(kind)) || value;
    if (fresh || !value) {
      if (!src?.lines.length) return;
      value = archiveToText(titleText, src.lines);
    }
    setTextDraft({ kind, value }); setShowArchive(kind); setSaved(""); setError("");
  };
  const storeText = async () => {
    if (!canEdit || !textDraft?.value.trim()) return;
    const { kind, value } = textDraft;
    if (archiveOf(kind) && !window.confirm("Overwrite the existing text archive? Other archives will not change. / 覆盖现有文本归档？其他归档不会改变。")) return;
    setSaving(true); setError("");
    try {
      await asResearcher(async () => {
        await saveTextArchive(path, value, kind);
        const check = await loadTranscriptArchive(path, kind);
        if (!check || check.text !== value) throw new Error("Archive could not be verified after saving. / 归档保存后校验失败。");
        setArchiveOf(kind, check); setTextDraft(null); setShowArchive(kind);
        localStorage.removeItem(textDraftKey(kind));
        setSaved("Text archive saved / 文本归档已保存");
      });
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSaving(false); }
  };
  const fileBase = titleText.replace(/[\\/:*?"<>|]+/g, "_").slice(0, 80);

  const reSignIn = async () => {
    setSaving(true); setError("");
    try {
      await wpLogin("researcher", password);
      setPassword(""); setNeedSignIn(false);
    } catch { setError("Wrong password. / 密码错误。"); setSaving(false); return; }
    const action = retry.current;
    retry.current = null;
    if (!action) { setSaving(false); return; }
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSaving(false); }
  };

  const share = () => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("__site", "researcher"); url.searchParams.set("tab", "interviews"); url.searchParams.set("rec", path);
    navigator.clipboard?.writeText(url.toString()); setSaved("Link copied / 链接已复制");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 pt-6">
          {canEdit ? (
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Title / 标题</label>
              <Input value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} />
              <label htmlFor="interview-recruitment" className="text-xs text-muted-foreground">Recruitment source / 招募来源</label>
              <Textarea id="interview-recruitment" rows={2} value={meta.recruitmentSource || ""} onChange={(e) => setMeta({ ...meta, recruitmentSource: e.target.value })} />
              <label className="text-xs text-muted-foreground">Notes / 备注</label>
              <Textarea rows={2} value={meta.notes} onChange={(e) => setMeta({ ...meta, notes: e.target.value })} />
              <label className="text-xs text-muted-foreground">Transcription instructions / 转录指令（例如 A/B 是谁、专有名词）</label>
              <Textarea rows={3} value={meta.instructions} onChange={(e) => setMeta({ ...meta, instructions: e.target.value })} />
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={save} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save / 保存
                </Button>
                <Button variant="outline" onClick={share}><Link2 className="mr-2 h-4 w-4" />Copy link / 复制链接</Button>
                <input ref={replaceInput} type="file" accept="audio/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0]; e.target.value = "";
                  if (!file) return;
                  setSaving(true); setError("");
                  try {
                    await asResearcher(async () => { await replaceRecording(path, file); });
                    setAudio(""); setPlaying(false); setPosition(0);
                    setAudio(await playUrl(path)); setSaved("Recording replaced / 录音已替换"); onSaved();
                  } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
                  finally { setSaving(false); }
                }} />
                <Button variant="outline" disabled={saving} onClick={() => replaceInput.current?.click()}><Upload className="mr-2 h-4 w-4" />Replace recording / 替换录音</Button>
                <Button variant="destructive" disabled={saving} onClick={async () => {
                  if (!window.confirm("Delete this recording and its notes? This cannot be undone. / 删除这条录音和备注？不可恢复。")) return;
                  setSaving(true); setError("");
                  try { await asResearcher(async () => { await deleteRecording(path); localStorage.removeItem(draftKey); onDeleted(); }); }
                  catch (e) { setError(e instanceof Error ? e.message : String(e)); setSaving(false); }
                }}><Trash2 className="mr-2 h-4 w-4" />Delete / 删除</Button>
                {dirty && !saving && <span className="text-sm text-destructive">Unsaved changes — click Save / 有未保存的修改，请点保存</span>}
                {saved && !dirty && <span className="text-sm text-muted-foreground">{saved}</span>}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="font-medium text-foreground">{rec.meta.title || displayName(path)}</p>
              {rec.meta.recruitmentSource && <div><p className="text-xs text-muted-foreground">Recruitment source / 招募来源</p><p className="whitespace-pre-wrap text-sm">{rec.meta.recruitmentSource}</p></div>}
              {rec.meta.notes && (
                <div className="pt-1">
                  <p className="text-xs text-muted-foreground">Notes / 备注</p>
                  <p className="whitespace-pre-wrap text-sm text-foreground">{rec.meta.notes}</p>
                </div>
              )}
              {rec.meta.instructions && (
                <div className="space-y-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto w-full justify-between whitespace-normal py-2 text-left"
                    aria-expanded={showInstructions}
                    onClick={() => setShowInstructions((value) => !value)}
                  >
                    <span>Transcription and translation instructions / 转录与翻译指导</span>
                    <ChevronDown className={`ml-2 h-4 w-4 shrink-0 transition-transform ${showInstructions ? "rotate-180" : ""}`} />
                  </Button>
                  {showInstructions && (
                    <div className="space-y-3 rounded-md border border-border bg-muted p-3 text-sm">
                      <div className="space-y-1 text-muted-foreground">
                        <p>If you want to download the recording and translate it yourself, you can copy the instructions below into your transcription or translation tool.</p>
                        <p>如果你想下载录音自行翻译，可以把以下指导复制给你的转录或翻译工具。</p>
                        <p>These instructions identify dialect, informal expressions, homophones with different meanings, and similarly pronounced phrases that may be misheard in this interview.</p>
                        <p>这些指导说明了访谈中容易出错的方言、非正式说法、中文同音异义词，以及发音近似、可能被听错的表述。</p>
                      </div>
                      <div className="whitespace-pre-wrap border-t border-border pt-3 text-foreground">{rec.meta.instructions}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {audio && !voiceRestricted && (
            <div className="flex items-center gap-3 rounded-md bg-muted px-3 py-2">
              <audio ref={player} src={audio} preload="metadata" controlsList="nodownload noplaybackrate" onContextMenu={(event) => event.preventDefault()}
                onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
                onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
                onWaiting={() => setBuffering(true)} onPlaying={() => setBuffering(false)} onCanPlay={() => setBuffering(false)}
                onError={() => { setPlaying(false); setBuffering(false); setPlayError("This recording could not play. Please refresh. / 录音无法播放，请刷新重试。"); }}
                onEnded={() => { setPlaying(false); setPosition(0); }} />
              <Button variant="ghost" size="icon" aria-label={playing ? "Pause recording" : "Play recording"} title={playing ? "Pause / 暂停" : "Play / 播放"} onClick={() => {
                const element = player.current;
                if (!element) return;
                if (element.paused) {
                  setPlayError(""); setBuffering(true); setPlaying(true);
                  element.play().catch(() => { setPlaying(false); setBuffering(false); setPlayError("Playback did not start. Please tap play again. / 播放未开始，请再点一次播放。"); });
                } else { element.pause(); setPlaying(false); }
              }}>
                {buffering && playing ? <Loader2 className="h-5 w-5 animate-spin" /> : playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <span className="text-sm text-foreground">{buffering && playing ? "Loading… / 加载中…" : "Play recording / 播放录音"}</span>
              <Slider className="min-w-0 flex-1" min={0} max={duration || 1} step={0.1} value={[Math.min(position, duration || 1)]}
                aria-label="Recording position / 录音位置" onValueChange={([next]) => {
                  const element = player.current;
                  if (!element || typeof next !== "number") return;
                  element.currentTime = next;
                  setPosition(next);
                }} />
            </div>
          )}
          {playError && <p className="text-sm text-destructive">{playError}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <Button className="h-auto min-h-10 max-w-full whitespace-normal py-2 text-left" onClick={generate} disabled={running || editing} variant={canEdit ? "secondary" : "default"}>
              {running && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate New Raw Translation and Transcription / 生成新的原始翻译与转录 (may take 20–30 minutes)
            </Button>
            <Button className="h-auto min-h-10 max-w-full whitespace-normal py-2 text-left" variant="destructive" onClick={() => setShowArchive("raw")} disabled={!archive || editing}>
              <Archive className="mr-2 h-4 w-4" />View Raw Archived Translation and Transcription / 查看原始翻译与转录归档
            </Button>
            {running && <Button variant="outline" onClick={() => abort.current?.abort()}><Square className="mr-2 h-4 w-4" />Stop / 停止</Button>}
            {canEdit && complete && !running && lines.length > 0 && !showArchive && (
              <Button onClick={storeArchive} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save to Raw transcript archive / 存入原始转录归档
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button className="h-auto min-h-10 max-w-full whitespace-normal py-2 text-left" variant="success" disabled={!editedArchive || busy} onClick={() => setShowArchive("edited")}>
              <Archive className="mr-2 h-4 w-4" />View Edited Archived Translation and Transcription / 查看修订翻译与转录归档
            </Button>
            {canEdit && archive && !busy && <Button variant="outline" disabled={saving || running} onClick={() => startEditing("edited")}><Pencil className="mr-2 h-4 w-4" />Edit transcript archive / 编辑转录归档</Button>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button className="h-auto min-h-10 max-w-full whitespace-normal py-2 text-left" variant="success" disabled={!anonArchive || busy} onClick={() => setShowArchive("anonymized")}>
              <Archive className="mr-2 h-4 w-4" />View Anonymized Edited Archived Translation and Transcription / 查看匿名修订翻译与转录归档
            </Button>
            {canEdit && !busy && <Button variant="outline" disabled={saving || running || !editedArchive} onClick={generateAnonymized}>Generate from current Edited archive / 用当前修订归档生成</Button>}
            {canEdit && anonArchive && !busy && <Button variant="outline" disabled={saving || running} onClick={() => startEditing("anonymized")}><Pencil className="mr-2 h-4 w-4" />Edit / 编辑</Button>}
            {anonProgress && <span className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Anonymizing… / 匿名化中… {anonProgress}</span>}
          </div>
          {([["text", "View Edited Archived Translation and Transcription in Text / 查看修订翻译与转录归档文本版", editedArchive, "edited"], ["anonymized-text", "View Anonymized Edited Archived Translation and Transcription in Text / 查看匿名修订翻译与转录归档文本版", anonArchive, "anonymized"]] as const).map(([kind, label, src, suffix]) => (
            <div key={kind} className="flex flex-wrap items-center gap-2">
              <Button className="h-auto min-h-10 max-w-full whitespace-normal py-2 text-left" variant="success" disabled={!archiveOf(kind) || busy} onClick={() => setShowArchive(kind)}>
                <Archive className="mr-2 h-4 w-4" />{label}
              </Button>
              {archiveOf(kind)?.text && <Button variant="outline" onClick={() => downloadText(archiveOf(kind)!.text!, `${fileBase}-${kind}.txt`)}><Download className="mr-2 h-4 w-4" />Download TXT / 下载 TXT</Button>}
              {canEdit && !busy && <Button variant="outline" disabled={saving || running || !src} onClick={() => startText(kind, true)}>Generate from current {suffix === "edited" ? "Edited" : "Anonymized"} archive / 用当前{suffix === "edited" ? "修订" : "匿名"}归档生成</Button>}
              {canEdit && archiveOf(kind) && !busy && <Button variant="outline" disabled={saving || running} onClick={() => startText(kind, false)}><Pencil className="mr-2 h-4 w-4" />Edit / 编辑</Button>}
            </div>
          ))}
          {canEdit && (editing || textDraft) && (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="success" disabled={saving || (editing ? !editLines.some((line) => line.zh.trim() || line.en.trim()) : !textDraft?.value.trim())} onClick={editing ? storeEditedArchive : storeText}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{editing ? (lineKind === "edited" ? "Save to Edited archive / 存入修订归档" : "Save to Anonymized archive / 存入匿名归档") : "Save text archive / 存入文本归档"}
              </Button>
              <Button variant="outline" disabled={saving} onClick={() => { setEditing(false); setTextDraft(null); setShowArchive(false); }}><X className="mr-2 h-4 w-4" />Cancel / 取消</Button>
            </div>
          )}
          {canEdit && !running && !complete && lines.length > 0 && !showArchive && (
            <p className="text-sm text-muted-foreground">This run was not completed, so it cannot be saved to the archive. Generate again and let it finish. / 本次生成未完成，不能存入归档；请重新生成并等待全部完成。</p>
          )}
          {canEdit && needSignIn && (
            <form className="flex flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); void reSignIn(); }}>
              <Input type="password" autoComplete="current-password" placeholder="Researcher password / 研究者密码" value={password} onChange={(e) => setPassword(e.target.value)} className="max-w-xs" />
              <Button type="submit" disabled={saving || !password}>Sign in and continue / 登录并继续</Button>
            </form>
          )}
          {saved && !canEdit ? null : saved && <p className="text-sm text-muted-foreground">{saved}</p>}
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>each click makes a fresh transcript and translation using the latest gemini flash model</p>
            <p>the transcript and translation will appear gradually</p>
            <p>It can take up to 20 minutes for the whole transcription and translation.</p>
            <p>You can view the previously saved originals in the Raw archive and manual corrections in the Edited archive.</p>
          </div>
          {progress && (
            <div className="space-y-1">
              <Progress value={progress.total ? (progress.done / progress.total) * 100 : 0} />
              <p className="text-xs text-muted-foreground">{`${progress.done} / ${progress.total} sections · ${lines.length} sentences`}</p>
            </div>
          )}
          {running && !progress && <p className="text-xs text-muted-foreground">Downloading and reading audio… / 下载并读取录音…</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
      {showArchive && <h3 className="font-medium text-foreground">{{
        raw: "Raw archive / 原始归档", edited: "Edited archive / 修订归档", anonymized: "Anonymized Edited archive / 匿名修订归档",
        text: "Edited archive in text / 修订归档文本版", "anonymized-text": "Anonymized Edited archive in text / 匿名修订归档文本版",
      }[showArchive]}{(editing || textDraft) && " — editing, not saved yet / 编辑中，尚未保存"}</h3>}
      {showArchive && !editing && !textDraft && !archiveOf(showArchive) && <p className="text-sm text-muted-foreground">No transcript archive has been saved yet. / 暂无已保存的转录归档</p>}
      {canEdit && textDraft ? (
        <Textarea aria-label="Text archive" className="min-h-[60vh] font-mono text-sm" value={textDraft.value} disabled={saving}
          onChange={(e) => { setTextDraft({ ...textDraft, value: e.target.value }); localStorage.setItem(textDraftKey(textDraft.kind), e.target.value); }} />
      ) : (showArchive === "text" || showArchive === "anonymized-text") && archiveOf(showArchive)?.text ? (
        <pre className="whitespace-pre-wrap rounded-md border border-border bg-card p-3 text-sm text-foreground">{archiveOf(showArchive)?.text}</pre>
      ) : null}
      <ol className="space-y-2">
        {(showArchive === "text" || showArchive === "anonymized-text" ? [] : canEdit && editing ? editLines : showArchive ? archiveOf(showArchive)?.lines || [] : lines).map((l, i) => (
          <li key={i} className="flex gap-3 rounded-md border border-border bg-card p-3">
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${l.s === "A" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{l.s}</span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs text-muted-foreground">#{i + 1}</p>
              {canEdit && editing ? <>
                <label className="flex items-center gap-2 text-sm">Speaker / 说话人
                  <select aria-label={`Speaker ${i + 1}`} className="rounded-md border border-input bg-background p-1 text-foreground" value={l.s} disabled={saving} onChange={(e) => changeLine(i, { s: e.target.value === "B" ? "B" : "A" })}><option value="A">A</option><option value="B">B</option></select>
                </label>
                <Textarea aria-label={`Chinese transcript ${i + 1}`} value={l.zh} disabled={saving} onChange={(e) => changeLine(i, { zh: e.target.value })} />
                <Textarea aria-label={`English translation ${i + 1}`} value={l.en} disabled={saving} onChange={(e) => changeLine(i, { en: e.target.value })} />
              </> : <><p className="text-foreground">{l.zh}</p>{l.en && <p className="text-sm text-muted-foreground">{l.en}</p>}</>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
