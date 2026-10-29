import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Mic, Square, Trash2, Play, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VoiceRecorder } from "@/lib/ai";
import { createClonedVoice, deleteClonedVoice, speakClonedVoice } from "@/lib/voice-clone.functions";
import { addFamilyVoice, blobToBase64, listFamilyVoices, onFamilyVoicesChanged, renameFamilyVoice, removeFamilyVoice, type FamilyVoice } from "@/lib/family-voices";
import { FAMILY_VOICE_MODELS, DEFAULT_FAMILY_VOICE_MODEL, VOICE_RECORDING_SECONDS, VOICE_MIN_RECORDING_SECONDS, familyVoiceModelName, FAMILY_VOICE_PRICE_SOURCE, FAMILY_VOICE_CLONE_SOURCE, type FamilyVoiceModel } from "@/lib/family-voice-models";

const SAMPLE_ZH = "今天天气不错，我刚吃完饭。家里一切都好，你别担心。等会儿有人来帮忙，你跟他好好说话。我晚点再给你打电话。";
const SAMPLE_EN = "The weather is nice today and I just had lunch. Everything at home is fine, don't worry. Someone is coming to help soon, please be kind to them. I'll call you again later.";

export function FamilyVoiceCard({ caredOneId, caredOneName }: { caredOneId: string; caredOneName: string }) {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  const id = String(caredOneId).replace(/^wp-/, "");
  const [voices, setVoices] = useState<FamilyVoice[]>([]);
  const [label, setLabel] = useState("");
  const [model, setModel] = useState<FamilyVoiceModel>(DEFAULT_FAMILY_VOICE_MODEL);
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

  useEffect(() => {
    const load = () => setVoices(listFamilyVoices(id));
    load();
    return onFamilyVoicesChanged(load);
  }, [id]);

  useEffect(() => {
    setPreviewVoiceId((current) => voices.some((v) => v.id === current) ? current : voices[0]?.id || "");
  }, [voices]);

  useEffect(() => () => { audio.current?.pause(); if (timer.current) clearInterval(timer.current); rec.current?.cancel(); }, []);

  const start = async () => {
    setError(null);
    try {
      rec.current = new VoiceRecorder();
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
    setBusy("new");
    try {
      const { voiceId } = await createClonedVoice({ data: { audioBase64: await blobToBase64(blob), mime: "audio/wav", model } });
      addFamilyVoice({ id: crypto.randomUUID(), voiceId, model, label: label.trim() || (zh ? "亲友声音" : "Family voice"), caredOneId: id, caredOneName, createdAt: new Date().toISOString() });
      setLabel("");
    } catch (e: any) {
      setError((zh ? "声音复刻失败：" : "Voice cloning failed: ") + (e?.message || ""));
    } finally { setBusy(null); }
  };

  const test = async (v: FamilyVoice, text?: string) => {
    audio.current?.pause(); setPlayingId(null);
    setBusy(v.id); setError(null);
    try {
      const { audioBase64 } = await speakClonedVoice({ data: { voiceId: v.voiceId, text: text?.trim() || (zh ? `你好，我是${v.label}。` : `Hi, it's ${v.label}.`), ...(v.model ? { model: v.model } : {}) } });
      const player = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
      audio.current = player;
      player.onended = () => setPlayingId(null);
      player.onerror = () => { setPlayingId(null); setError(zh ? "音频播放失败，请重新试听。" : "Audio playback failed. Please try again."); };
      await player.play();
      setPlayingId(v.id);
    } catch (e: any) { setPlayingId(null); setError((zh ? "试听失败：" : "Preview failed: ") + (e?.message || "")); }
    finally { setBusy(null); }
  };

  const saveName = (v: FamilyVoice) => {
    if (!draftName.trim()) return;
    try { renameFamilyVoice(v.id, draftName); setEditingId(null); }
    catch { setError(zh ? "改名未保存，请重试。" : "Name was not saved. Please try again."); }
  };

  const remove = async (v: FamilyVoice) => {
    if (playingId === v.id) { audio.current?.pause(); setPlayingId(null); }
    setBusy(v.id);
    try { await deleteClonedVoice({ data: { voiceId: v.voiceId } }); removeFamilyVoice(v.id); }
    catch { setError(zh ? "云端声音未删除，已保留记录，请重试。" : "Cloud voice was not deleted. The record is retained; please retry."); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{zh ? "亲友声音" : "Family Voices"}</h2>
        <p className="text-sm text-muted-foreground">
          {zh ? `为${caredOneName}录下家人的声音。AI 来电时可以用这个声音说话。目前只保存在这台设备上。` : `Record a family member's voice for ${caredOneName}. AI calls can then speak in that voice. Saved on this device only for now.`}
        </p>
      </div>

      <section className="space-y-3 border-t pt-4">
        <h3 className="font-semibold text-foreground">{zh ? "模型比较" : "Model comparison"}</h3>
        <p className="text-xs text-muted-foreground">{zh ? "北京原价 · 2026-10-29；以下复刻均免费，合成按量收费。一个汉字计 2 个字符。Token 计费型号单独列出，不假定最便宜。" : "Beijing list prices · 2026-10-29. Enrollment is free; synthesis is metered. One Han character counts as 2 billable characters. Token billing is listed separately, not ranked as cheapest."}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm text-left">
            <thead><tr className="border-b text-muted-foreground"><th className="py-2 pr-3">{zh ? "型号" : "Model"}</th><th className="py-2 pr-3">{zh ? "合成价格" : "Synthesis price"}</th><th className="py-2 pr-3">{zh ? "建议录音" : "Recording"}</th><th className="py-2">{zh ? "复刻 / 试听" : "Clone / preview"}</th></tr></thead>
            <tbody>{FAMILY_VOICE_MODELS.map((item) => {
              const saved = voices.filter((v) => (v.model || DEFAULT_FAMILY_VOICE_MODEL) === item.id);
              return <tr key={item.id} className="border-b align-top">
                <td className="py-3 pr-3 font-medium">{item.name}</td>
                <td className="py-3 pr-3">{item.price === null ? (zh ? "输入 ¥1.5 + 输出 ¥12 / 百万 Token" : "Input ¥1.5 + output ¥12 / million tokens") : `¥${item.price} / ${zh ? "万字符" : "10k characters"}`}</td>
                <td className="py-3 pr-3">10–20 {zh ? "秒" : "s"}</td>
                <td className="py-3 space-y-2">
                  <Button size="sm" variant={model === item.id ? "secondary" : "outline"} disabled={recording || busy !== null} onClick={() => setModel(item.id)} aria-label={`${zh ? "选择复刻" : "Select cloning"} ${item.name}`}><Mic className="mr-1 h-4 w-4" />{model === item.id ? (zh ? "已选择" : "Selected") : (zh ? "选择复刻" : "Select")}</Button>
                  {saved.map((v) => <Button key={v.id} size="sm" variant="ghost" className="flex max-w-full" disabled={!previewText.trim() || recording || busy !== null} onClick={() => void test(v, previewText)} aria-label={`${zh ? "比较试听" : "Compare preview"} ${item.name} ${v.label}`}><Play className="mr-1 h-4 w-4 shrink-0" /><span className="break-words whitespace-normal">{v.label}</span></Button>)}
                </td>
              </tr>;
            })}</tbody>
          </table>
        </div>
        <div className="flex gap-4 text-xs text-primary"><a href={FAMILY_VOICE_PRICE_SOURCE} target="_blank" rel="noreferrer">{zh ? "官方价格" : "Official prices"}</a><a href={FAMILY_VOICE_CLONE_SOURCE} target="_blank" rel="noreferrer">{zh ? "官方复刻要求" : "Recording requirements"}</a></div>
      </section>

      <div className="border-t pt-4 space-y-3">
        <Select value={model} onValueChange={(value) => setModel(value as FamilyVoiceModel)} disabled={recording || busy !== null}>
          <SelectTrigger aria-label={zh ? "复刻模型" : "Cloning model"}><SelectValue /></SelectTrigger>
          <SelectContent>{FAMILY_VOICE_MODELS.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
        </Select>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={zh ? "这是谁的声音，例如：女儿小红" : "Whose voice, e.g. daughter Amy"} />
        <div className="rounded-lg bg-muted/50 p-3 text-sm text-foreground">
          <p className="mb-1 text-xs text-muted-foreground">{zh ? "在安静的地方，用平常的语气朗读（10–20 秒，20 秒自动停止）：" : "In a quiet place, read naturally (10–20 seconds, stops automatically at 20):"}</p>
          {zh ? SAMPLE_ZH : SAMPLE_EN}
        </div>
        {recording ? (
          <Button onClick={() => void stop()} variant="destructive" className="w-full">
            <Square className="h-4 w-4 mr-1" /> {zh ? `停止并复刻（${seconds} 秒）` : `Stop & clone (${seconds}s)`}
          </Button>
        ) : (
          <Button onClick={() => void start()} disabled={busy !== null} className="w-full">
            {busy === "new" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Mic className="h-4 w-4 mr-1" />}
            {busy === "new" ? (zh ? "正在复刻声音…" : "Cloning voice…") : (zh ? "开始录音" : "Start recording")}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {voices.length === 0 && <p className="text-sm text-muted-foreground">{zh ? "还没有录制的声音。" : "No voices yet."}</p>}
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
              <p className="text-xs text-muted-foreground">{familyVoiceModelName(v.model)}</p>
            </div>
            {editingId !== v.id && <Button size="sm" variant="ghost" onClick={() => { setEditingId(v.id); setDraftName(v.label); }} aria-label={zh ? `改名：${v.label}` : `Rename: ${v.label}`} title={zh ? "改名" : "Rename"}><Pencil className="h-4 w-4" /></Button>}
            <Button size="sm" variant="outline" onClick={() => void test(v)} disabled={busy !== null || recording} aria-label={zh ? "试听" : "Preview"} title={zh ? "试听" : "Preview"}>
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
          <SelectContent>{voices.map((v) => <SelectItem key={v.id} value={v.id}>{v.label} · {familyVoiceModelName(v.model)}</SelectItem>)}</SelectContent>
        </Select>
        <Textarea aria-label={zh ? "试听文字" : "Preview text"} value={previewText} onChange={(e) => setPreviewText(e.target.value)} maxLength={2000} placeholder={zh ? "输入想让亲友声音说的话…" : "Enter the words for this voice…"} className="min-h-24" />
        <div className="flex flex-wrap gap-2">
          <Button disabled={!previewText.trim() || !previewVoiceId || busy !== null || recording} onClick={() => { const voice = voices.find((v) => v.id === previewVoiceId); if (voice) void test(voice, previewText); }}>
            {busy === previewVoiceId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}{busy === previewVoiceId ? (zh ? "正在合成…" : "Synthesizing…") : (zh ? "合成并播放" : "Synthesize & play")}
          </Button>
          {playingId && <Button variant="outline" onClick={() => { audio.current?.pause(); setPlayingId(null); }}><Square className="mr-2 h-4 w-4" />{zh ? "停止播放" : "Stop playback"}</Button>}
        </div>
      </section>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
