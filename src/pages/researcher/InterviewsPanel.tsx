import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Loader2, Plus, Save, Square, Link2, Trash2 } from "lucide-react";
import {
  listRecordings, uploadRecording, generateTranscript, playUrl, displayName, saveMeta, deleteRecording,
  type Recording, type Line, type Meta,
} from "@/features/interviews/transcribe";

const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;
const clock = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}`;
const titleOf = (r: Recording) => r.meta?.title || displayName(r.path);

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

  const refresh = () => listRecordings().then((d) => { setItems(d); setSelected((s) => (s && d.some((r) => r.path === s) ? s : d[0]?.path || "")); }).catch((e) => setError(e.message));
  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    if (!selected) return;
    const url = new URL(window.location.href);
    url.searchParams.set("rec", selected);
    window.history.replaceState({}, "", url.toString());
  }, [selected]);

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("audio/") && !/\.(mp3|m4a|wav|aac|ogg|flac|webm)$/i.test(file.name)) { setError("Please choose an audio file. / 请选择音频文件"); return; }
    if (file.size > 500 * 1024 * 1024) { setError("Recordings up to 500 MB are supported. / 最大 500 MB"); return; }
    setError(""); setUploading(true);
    try {
      const path = await uploadRecording(file);
      await saveMeta(path, { title: file.name.replace(/\.[^.]+$/, ""), notes: "", instructions: "" });
      await refresh(); setSelected(path);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const current = items?.find((r) => r.path === selected);

  return (
    <div className="mx-auto grid max-w-5xl gap-4 px-4 py-6 md:grid-cols-[240px_1fr]">
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
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!items && <p className="text-sm text-muted-foreground">Loading… / 加载中…</p>}
        {items?.length === 0 && <p className="text-sm text-muted-foreground">No recordings yet. / 暂无录音</p>}
        {items?.map((r) => (
          <button key={r.path} onClick={() => setSelected(r.path)}
            className={`w-full rounded-md px-3 py-2 text-left text-sm ${r.path === selected ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}>
            <div className="truncate font-medium">{titleOf(r)}</div>
            <div className="text-xs opacity-80">{mb(r.size)} · {new Date(r.created).toLocaleDateString()}</div>
          </button>
        ))}
      </aside>
      {current ? <Transcript key={current.path} rec={current} canEdit={canEdit} onSaved={refresh} onDeleted={() => { setSelected(""); refresh(); }} /> : null}
    </div>
  );
}

function Transcript({ rec, canEdit, onSaved, onDeleted }: { rec: Recording; canEdit: boolean; onSaved: () => void; onDeleted: () => void }) {
  const path = rec.path;
  const [audio, setAudio] = useState("");
  const [meta, setMeta] = useState<Meta>(rec.meta);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const abort = useRef<AbortController | null>(null);

  useEffect(() => { playUrl(path).then(setAudio).catch(() => undefined); return () => abort.current?.abort(); }, [path]);

  const save = async () => {
    setSaving(true); setSaved(""); setError("");
    try { await saveMeta(path, meta); setSaved("Saved / 已保存"); onSaved(); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSaving(false); }
  };

  const generate = async () => {
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    setLines([]); setError(""); setRunning(true); setProgress(null);
    try {
      await generateTranscript(path, (done, total) => setProgress({ done, total }), (l) => setLines((p) => [...p, ...l]), ctrl.signal);
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") setError(e instanceof Error ? e.message : String(e));
    } finally { setRunning(false); }
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
              <label className="text-xs text-muted-foreground">Notes / 备注</label>
              <Textarea rows={2} value={meta.notes} onChange={(e) => setMeta({ ...meta, notes: e.target.value })} />
              <label className="text-xs text-muted-foreground">Transcription instructions / 转录指令（例如 A/B 是谁、专有名词）</label>
              <Textarea rows={3} value={meta.instructions} onChange={(e) => setMeta({ ...meta, instructions: e.target.value })} />
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={save} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save / 保存
                </Button>
                <Button variant="outline" onClick={share}><Link2 className="mr-2 h-4 w-4" />Copy link / 复制链接</Button>
                <Button variant="destructive" disabled={saving} onClick={async () => {
                  if (!window.confirm("Delete this recording and its notes? This cannot be undone. / 删除这条录音和备注？不可恢复。")) return;
                  setSaving(true); setError("");
                  try { await deleteRecording(path); onDeleted(); }
                  catch (e) { setError(e instanceof Error ? e.message : String(e)); setSaving(false); }
                }}><Trash2 className="mr-2 h-4 w-4" />Delete / 删除</Button>
                {saved && <span className="text-sm text-muted-foreground">{saved}</span>}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="font-medium text-foreground">{rec.meta.title || displayName(path)}</p>
              {rec.meta.notes && <p className="whitespace-pre-wrap text-sm text-muted-foreground">{rec.meta.notes}</p>}
              {rec.meta.instructions && (
                <p className="whitespace-pre-wrap text-xs text-muted-foreground">Transcription instructions / 转录指令: {rec.meta.instructions}</p>
              )}
            </div>
          )}
          {audio && <audio controls src={audio} className="w-full" preload="metadata" />}
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={generate} disabled={running} variant={canEdit ? "secondary" : "default"}>
              {running && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate transcript / 生成转录
            </Button>
            {running && <Button variant="outline" onClick={() => abort.current?.abort()}><Square className="mr-2 h-4 w-4" />Stop / 停止</Button>}
          </div>
          <p className="text-xs text-muted-foreground">
            each click makes a fresh transcript and translation using the latest gemini flash model / 每次点击都会使用最新的 Gemini Flash 模型重新生成转录和翻译
          </p>
          {progress && (
            <div className="space-y-1">
              <Progress value={progress.total ? (progress.done / progress.total) * 100 : 0} />
              <p className="text-xs text-muted-foreground">{`${progress.done} / ${progress.total} segments (30 sec each) · ${lines.length} sentences`}</p>
            </div>
          )}
          {running && !progress && <p className="text-xs text-muted-foreground">Downloading and reading audio… / 下载并读取录音…</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
      <ol className="space-y-2">
        {lines.map((l, i) => (
          <li key={i} className="flex gap-3 rounded-md border border-border bg-card p-3">
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${l.s === "A" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{l.s}</span>
            <div className="min-w-0 space-y-1">
              <p className="text-xs text-muted-foreground">#{i + 1} · ~{clock(l.t)}</p>
              <p className="text-foreground">{l.zh}</p>
              {l.en && <p className="text-sm text-muted-foreground">{l.en}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
