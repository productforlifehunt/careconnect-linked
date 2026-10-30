import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Mic, Square, Trash2, Play, Pencil, Check, X, RefreshCw, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VoiceRecorder, transcribeAudio } from "@/lib/ai";
import { loadSavedFamilyVoices, saveFamilyVoiceRecording, updateSavedFamilyVoice, savedVoiceAudio, importLocalFamilyVoices, listFamilyVoices, onFamilyVoicesChanged, type FamilyVoice } from "@/lib/family-voices";
import { FAMILY_VOICE_STATE } from "@/features/family-voices/schema";
import { DEFAULT_FAMILY_VOICE_MODEL, VOICE_RECORDING_SECONDS, VOICE_MIN_RECORDING_SECONDS } from "@/lib/family-voice-models";

const SAMPLE_ZH = "今天天气不错，我刚吃完饭。家里一切都好，你别担心。等会儿有人来帮忙，你跟他好好说话。我晚点再给你打电话。";
const SAMPLE_EN = "The weather is nice today and I just had lunch. Everything at home is fine, don't worry. Someone is coming to help soon, please be kind to them. I'll call you again later.";

export function FamilyVoiceCard({ caredOneId, caredOneName }: { caredOneId: string; caredOneName: string }) {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  const id = String(caredOneId).replace(/^wp-/, "");
  const [voices, setVoices] = useState<FamilyVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [localCount, setLocalCount] = useState(0);
  const [label, setLabel] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [previewVoiceId, setPreviewVoiceId] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const rec = useRef<VoiceRecorder | null>(null);
  const timer = useRef<number | null>(null);
  const secs = useRef(0);
  const dictationRec = useRef<VoiceRecorder | null>(null);
  const [dictating, setDictating] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () => {
      setLoading(true);
      void loadSavedFamilyVoices(id).then((rows) => {
        if (!alive) return;
        setVoices(rows); setLoadFailed(false);
        setLocalCount(listFamilyVoices(id).filter((v) => !rows.some((r) => r.voiceId === v.voiceId)).length);
      }).catch((e) => { if (alive) { setLoadFailed(true); setError(e instanceof Error ? e.message : "Voices could not be loaded"); } })
        .finally(() => { if (alive) setLoading(false); });
    };
    load(); const unsubscribe = onFamilyVoicesChanged(load);
    return () => { alive = false; unsubscribe(); };
  }, [id]);

  useEffect(() => {
    setPreviewVoiceId((current) => voices.some((v) => v.id === current) ? current : voices[0]?.id || "");
  }, [voices]);

  useEffect(() => () => { audio.current?.pause(); if (timer.current) clearInterval(timer.current); rec.current?.cancel(); dictationRec.current?.cancel(); }, []);

  const startDictation = async () => {
    if (recording || busy || dictating || transcribing) return;
    setError(null);
    audio.current?.pause(); setPlayingId(null);
    const recorder = new VoiceRecorder();
    dictationRec.current = recorder;
    try {
      await recorder.start();
      setDictating(true);
    } catch {
      recorder.cancel(); dictationRec.current = null;
      setError(zh ? "无法使用麦克风，请允许麦克风权限。" : "Microphone unavailable — please allow access.");
    }
  };

  const stopDictation = async () => {
    const recorder = dictationRec.current; dictationRec.current = null;
    setDictating(false);
    if (!recorder) return;
    setTranscribing(true); setError(null);
    try {
      const blob = await recorder.stop();
      if (!blob) throw new Error(zh ? "没有录到声音，请再说一次。" : "Nothing was recorded — please try again.");
      const text = await transcribeAudio(blob, zh ? "zh" : "en");
      if (!text) throw new Error(zh ? "没听清，请再说一次。" : "Didn't catch that — please try again.");
      setPreviewText((current) => [current.trim(), text].filter(Boolean).join(" ").slice(0, 2000));
    } catch (e) {
      setError((zh ? "语音输入失败：" : "Voice input failed: ") + (e instanceof Error ? e.message : String(e)));
    } finally { setTranscribing(false); }
  };

  const start = async () => {
    setError(null);
    try {
      rec.current = new VoiceRecorder(true);
      await rec.current.start();
      setRecording(true);
      setSeconds(0); secs.current = 0;
      timer.current = window.setInterval(() => {
        secs.current += 1; setSeconds(secs.current);
        if (secs.current >= VOICE_RECORDING_SECONDS) void stop();
      }, 1000);
    } catch { setError(zh ? "无法使用麦克风，请允许麦克风权限。" : "Microphone unavailable — please allow access."); }
  };

  const stop = async () => {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
    const r = rec.current; rec.current = null;
    setRecording(false);
    if (!r) return;
    const blob = await r.stop();
    if (!blob || secs.current < VOICE_MIN_RECORDING_SECONDS) { setError(zh ? "录音太短，请连续朗读 10–20 秒。" : "Too short — read for 10–20 seconds."); return; }
    const pcm = new Int16Array(await blob.slice(44).arrayBuffer());
    let peak = 0; for (let i = 0; i < pcm.length; i++) { const a = Math.abs(pcm[i] ?? 0); if (a > peak) peak = a; }
    if (peak < 300) { setError(zh ? "没有录到声音：麦克风收到的是静音。请检查浏览器麦克风权限、系统输入设备是否选对、是否静音，然后靠近麦克风重新录。" : "No sound was captured — the microphone recorded silence. Check mic permission, the selected input device and mute, then record again closer to the mic."); return; }
    setBusy("new");
    try {
      const voice = await saveFamilyVoiceRecording(id, label.trim() || (zh ? "亲友声音" : "Family voice"), blob);
      if (voice.state !== FAMILY_VOICE_STATE.ready) setError((zh ? "原始录音已保存，复刻未完成：" : "Original saved; cloning incomplete: ") + voice.error);
      setLabel("");
    } catch (e: any) {
      setError((zh ? "声音复刻失败：" : "Voice cloning failed: ") + (e?.message || ""));
    } finally { setBusy(null); }
  };

  const test = async (v: FamilyVoice, text?: string) => {
    audio.current?.pause(); setPlayingId(null);
    setBusy(v.id); setError(null);
    try {
      const { audioBase64 } = await savedVoiceAudio(v, text?.trim() || (zh ? `你好，我是${v.label}。` : `Hi, it's ${v.label}.`));
      const player = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
      // Constant full player gain; never fade or split the returned recording.
      player.volume = 1;
      audio.current = player;
      player.onended = () => setPlayingId(null);
      player.onerror = () => { setPlayingId(null); setError(zh ? "音频播放失败，请重新试听。" : "Audio playback failed. Please try again."); };
      await player.play();
      setPlayingId(v.id);
    } catch (e: any) { setPlayingId(null); setError((zh ? "试听失败：" : "Preview failed: ") + (e?.message || "")); }
    finally { setBusy(null); }
  };

  const saveName = async (v: FamilyVoice) => {
    if (!draftName.trim()) return;
    try { await updateSavedFamilyVoice("rename", v, draftName.trim()); setEditingId(null); }
    catch { setError(zh ? "改名未保存，请重试。" : "Name was not saved. Please try again."); }
  };

  const remove = async (v: FamilyVoice) => {
    if (playingId === v.id) { audio.current?.pause(); setPlayingId(null); }
    setBusy(v.id);
    try { await updateSavedFamilyVoice("delete", v); }
    catch { setError(zh ? "云端声音未删除，已保留记录，请重试。" : "Cloud voice was not deleted. The record is retained; please retry."); }
    finally { setBusy(null); }
  };

  const original = async (v: FamilyVoice) => {
    setBusy(v.id); setError(null); audio.current?.pause();
    try { const result = await savedVoiceAudio(v); const player = new Audio(`data:${result.mime};base64,${result.audioBase64}`); player.volume = 1; audio.current = player; await player.play(); setPlayingId(v.id); player.onended = () => setPlayingId(null); }
    catch (e) { setError(e instanceof Error ? e.message : "Original recording unavailable"); }
    finally { setBusy(null); }
  };
  const retry = async (v: FamilyVoice) => {
    setBusy(v.id); setError(null);
    try { await updateSavedFamilyVoice("retry", v); } catch (e) { setError(e instanceof Error ? e.message : "Retry failed"); } finally { setBusy(null); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{zh ? "亲友声音" : "Family Voices"}</h2>
        <p className="text-sm text-muted-foreground">
          {zh ? `${caredOneName}的亲友声音 · 服务器保存` : `${caredOneName}'s family voices · Saved on server`}
        </p>
      </div>

      <div className="border-t pt-4 space-y-3">
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={zh ? "这是谁的声音，例如：女儿小红" : "Whose voice, e.g. daughter Amy"} />
        <div className="rounded-lg bg-muted/50 p-3 text-sm text-foreground">
          <p className="mb-1 text-xs text-muted-foreground">{zh ? "在安静的地方，用平常的语气朗读（建议 10–20 秒；读完可手动停止，最长 60 秒）：" : "In a quiet place, read naturally (10–20 seconds recommended; stop when finished, up to 60 seconds):"}</p>
          {zh ? SAMPLE_ZH : SAMPLE_EN}
        </div>
        {recording ? (
          <Button onClick={() => void stop()} variant="destructive" className="w-full">
            <Square className="h-4 w-4 mr-1" /> {zh ? `停止并复刻（${seconds} 秒）` : `Stop & clone (${seconds}s)`}
          </Button>
        ) : (
          <Button onClick={() => void start()} disabled={loading || loadFailed || busy !== null || dictating || transcribing} className="w-full">
            {busy === "new" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Mic className="h-4 w-4 mr-1" />}
            {busy === "new" ? (zh ? "正在复刻声音…" : "Cloning voice…") : (zh ? "开始录音" : "Start recording")}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {loading && <Loader2 className="h-5 w-5 animate-spin" aria-label={zh ? "正在读取声音" : "Loading voices"} />}
        {loadFailed && <Button variant="outline" onClick={() => { window.dispatchEvent(new Event("family-voices-changed")); }}><RefreshCw className="h-4 w-4 mr-1" />{zh ? "重新读取" : "Retry loading"}</Button>}
        {localCount > 0 && <div className="space-y-2"><p className="text-sm text-muted-foreground">{zh ? `本机另有 ${localCount} 个旧声音；旧录音样本未保存。` : `${localCount} older voices on this device; original recordings unavailable.`}</p><Button variant="outline" disabled={loading || loadFailed || busy !== null} onClick={async () => { setBusy("import"); try { await importLocalFamilyVoices(id); } catch (e) { setError(e instanceof Error ? e.message : "Import failed"); } finally { setBusy(null); } }}><CloudUpload className="h-4 w-4 mr-1" />{zh ? "保存旧声音到服务器" : "Save older voices to server"}</Button></div>}
        {!loading && !loadFailed && voices.length === 0 && <p className="text-sm text-muted-foreground">{zh ? "还没有录制的声音。" : "No voices yet."}</p>}
        {voices.map((v) => (
          <div key={v.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
            <div className="min-w-0 flex-1">
              {editingId === v.id ? (
                <div className="flex items-center gap-1">
                  <Input autoFocus aria-label={zh ? "声音名称" : "Voice name"} value={draftName} onChange={(e) => setDraftName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") saveName(v); if (e.key === "Escape") setEditingId(null); }} />
                  <Button size="icon" variant="ghost" disabled={!draftName.trim()} onClick={() => saveName(v)} aria-label={zh ? "保存名称" : "Save name"} title={zh ? "保存名称" : "Save name"}><Check className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} aria-label={zh ? "取消改名" : "Cancel rename"} title={zh ? "取消改名" : "Cancel rename"}><X className="h-4 w-4" /></Button>
                </div>
              ) : <p className="font-medium text-foreground break-words">{v.label}</p>}
              <p className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{v.audioSaved ? (zh ? "原始录音已保存" : "Original recording saved") : (zh ? "旧声音，无原始录音" : "Older voice, no original recording")}{v.state !== FAMILY_VOICE_STATE.ready ? (zh ? " · 复刻未完成" : " · Cloning incomplete") : ""}</p>
              {v.error && <p className="text-xs text-destructive">{v.error}</p>}
            </div>
            {editingId !== v.id && <Button size="sm" variant="ghost" onClick={() => { setEditingId(v.id); setDraftName(v.label); }} aria-label={zh ? `改名：${v.label}` : `Rename: ${v.label}`} title={zh ? "改名" : "Rename"}><Pencil className="h-4 w-4" /></Button>}
            {v.audioSaved && <Button size="sm" variant="ghost" onClick={() => void original(v)} disabled={busy !== null || recording} aria-label={zh ? "听原始录音" : "Play original recording"} title={zh ? "听原始录音" : "Play original recording"}><Mic className="h-4 w-4 mr-1" />{zh ? "原音" : "Original"}</Button>}
            {v.audioSaved && <Button size="sm" variant="ghost" onClick={() => void retry(v)} disabled={busy !== null || recording} aria-label={zh ? "从原始录音重新复刻" : "Reclone original recording"} title={zh ? "从原始录音重新复刻" : "Reclone original recording"}><RefreshCw className="h-4 w-4" /></Button>}
            <Button size="sm" variant="outline" onClick={() => void test(v)} disabled={busy !== null || recording || v.state !== FAMILY_VOICE_STATE.ready} aria-label={zh ? "试听" : "Preview"} title={zh ? "试听" : "Preview"}>
              {busy === v.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => void remove(v)} disabled={busy !== null || recording} aria-label={zh ? "删除" : "Delete"}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <section className="space-y-3 border-t pt-4">
        <h3 className="font-semibold text-foreground">{zh ? "文字试听" : "Text preview"}</h3>
        <Select value={previewVoiceId} onValueChange={setPreviewVoiceId} disabled={!voices.length || busy !== null}>
          <SelectTrigger aria-label={zh ? "试听声音" : "Preview voice"}><SelectValue placeholder={zh ? "选择亲友声音" : "Choose a family voice"} /></SelectTrigger>
          <SelectContent>{voices.map((v) => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}</SelectContent>
        </Select>
        <Textarea aria-label={zh ? "试听文字" : "Preview text"} value={previewText} onChange={(e) => setPreviewText(e.target.value)} maxLength={2000} placeholder={zh ? "输入想让亲友声音说的话…" : "Enter the words for this voice…"} className="min-h-24" />
        <div className="flex flex-wrap gap-2">
          <Button variant={dictating ? "destructive" : "outline"} disabled={recording || busy !== null || transcribing} onClick={() => void (dictating ? stopDictation() : startDictation())}>
            {transcribing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : dictating ? <Square className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
            {transcribing ? (zh ? "正在转成文字…" : "Transcribing…") : dictating ? (zh ? "停止并转文字" : "Stop & transcribe") : (zh ? "语音输入" : "Voice input")}
          </Button>
          <Button disabled={!previewText.trim() || !previewVoiceId || busy !== null || recording || dictating || transcribing} onClick={() => { const voice = voices.find((v) => v.id === previewVoiceId); if (voice) void test(voice, previewText); }}>
            {busy === previewVoiceId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}{busy === previewVoiceId ? (zh ? "正在合成…" : "Synthesizing…") : (zh ? "合成并播放" : "Synthesize & play")}
          </Button>
          {playingId && <Button variant="outline" onClick={() => { audio.current?.pause(); setPlayingId(null); }}><Square className="mr-2 h-4 w-4" />{zh ? "停止播放" : "Stop playback"}</Button>}
        </div>
      </section>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
