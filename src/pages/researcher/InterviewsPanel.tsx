import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, Sparkles, Square } from "lucide-react";
import {
  listRecordings, uploadRecording, generateTranscript, playUrl, displayName,
  type Recording, type Line,
} from "@/features/interviews/transcribe";

const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;
const clock = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}`;

/** Interview records: upload long recordings, then generate an A/B bilingual transcript. */
export default function InterviewsPanel() {
  const [items, setItems] = useState<Recording[] | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => listRecordings().then((d) => { setItems(d); setSelected((s) => s || d[0]?.path || ""); }).catch((e) => setError(e.message));
  useEffect(() => { refresh(); }, []);

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("audio/") && !/\.(mp3|m4a|wav|aac|ogg|flac|webm)$/i.test(file.name)) { setError("Please choose an audio file."); return; }
    if (file.size > 500 * 1024 * 1024) { setError("Recordings up to 500 MB are supported."); return; }
    setError(""); setUploading(true);
    try { await uploadRecording(file); await refresh(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-4 px-4 py-6 md:grid-cols-[240px_1fr]">
      <aside className="space-y-2">
        <input ref={fileRef} type="file" accept="audio/*,.m4a,.mp3,.wav" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        <Button className="w-full" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {uploading ? "Uploading… / 上传中…" : "Upload recording / 上传录音"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!items && <p className="text-sm text-muted-foreground">Loading…</p>}
        {items?.length === 0 && <p className="text-sm text-muted-foreground">No recordings yet. / 暂无录音</p>}
        {items?.map((r) => (
          <button key={r.path} onClick={() => setSelected(r.path)}
            className={`w-full rounded-md px-3 py-2 text-left text-sm ${r.path === selected ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}>
            <div className="truncate font-medium">{displayName(r.path)}</div>
            <div className="text-xs opacity-80">{mb(r.size)} · {new Date(r.created).toLocaleDateString()}</div>
          </button>
        ))}
      </aside>
      {selected ? <Transcript key={selected} path={selected} /> : null}
    </div>
  );
}

function Transcript({ path }: { path: string }) {
  const [audio, setAudio] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const abort = useRef<AbortController | null>(null);

  useEffect(() => { playUrl(path).then(setAudio).catch(() => undefined); return () => abort.current?.abort(); }, [path]);

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

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 pt-6">
          <p className="font-medium text-foreground">{displayName(path)}</p>
          {audio && <audio controls src={audio} className="w-full" preload="none" />}
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={generate} disabled={running}>
              {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate transcript / 生成转录
            </Button>
            {running && <Button variant="outline" onClick={() => abort.current?.abort()}><Square className="mr-2 h-4 w-4" />Stop / 停止</Button>}
          </div>
          <p className="text-xs text-muted-foreground">
            Each click transcribes the whole recording again from the audio. A = interviewer, B = interviewee. / 每次点击都会从录音重新转录。A = 访谈者，B = 受访者。
          </p>
          {progress && (
            <div className="space-y-1">
              <Progress value={progress.total ? (progress.done / progress.total) * 100 : 0} />
              <p className="text-xs text-muted-foreground">
                {running && progress.total === 0 ? "Reading audio… / 读取录音…" : `${progress.done} / ${progress.total} segments (3 min each) · ${lines.length} sentences`}
              </p>
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
