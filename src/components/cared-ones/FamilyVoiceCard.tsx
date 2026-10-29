import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Mic, Square, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoiceRecorder } from "@/lib/ai";
import { createClonedVoice, deleteClonedVoice, speakClonedVoice } from "@/lib/voice-clone.functions";
import { addFamilyVoice, blobToBase64, listFamilyVoices, onFamilyVoicesChanged, playBase64Mp3, removeFamilyVoice, type FamilyVoice } from "@/lib/family-voices";

const SAMPLE_ZH = "今天天气不错，我刚吃完饭。家里一切都好，你别担心。等会儿有人来帮忙，你跟他好好说话。我晚点再给你打电话。";
const SAMPLE_EN = "The weather is nice today and I just had lunch. Everything at home is fine, don't worry. Someone is coming to help soon, please be kind to them. I'll call you again later.";

export function FamilyVoiceCard({ caredOneId, caredOneName }: { caredOneId: string; caredOneName: string }) {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  const id = String(caredOneId).replace(/^wp-/, "");
  const [voices, setVoices] = useState<FamilyVoice[]>([]);
  const [label, setLabel] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<VoiceRecorder | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const load = () => setVoices(listFamilyVoices(id));
    load();
    return onFamilyVoicesChanged(load);
  }, [id]);

  const start = async () => {
    setError(null);
    try {
      rec.current = new VoiceRecorder();
      await rec.current.start();
      setRecording(true);
      setSeconds(0);
      timer.current = window.setInterval(() => setSeconds((s) => {
        if (s + 1 >= 30) void stop();
        return s + 1;
      }), 1000);
    } catch { setError(zh ? "无法使用麦克风，请允许麦克风权限。" : "Microphone unavailable — please allow access."); }
  };

  const stop = async () => {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
    const r = rec.current; rec.current = null;
    setRecording(false);
    if (!r) return;
    const blob = await r.stop();
    if (!blob || seconds < 6) { setError(zh ? "录音太短，请连续朗读 10–20 秒。" : "Too short — read for 10–20 seconds."); return; }
    setBusy("new");
    try {
      const { voiceId } = await createClonedVoice({ data: { audioBase64: await blobToBase64(blob), mime: "audio/wav" } });
      addFamilyVoice({ id: crypto.randomUUID(), voiceId, label: label.trim() || (zh ? "亲友声音" : "Family voice"), caredOneId: id, caredOneName, createdAt: new Date().toISOString() });
      setLabel("");
    } catch (e: any) {
      setError((zh ? "声音复刻失败：" : "Voice cloning failed: ") + (e?.message || ""));
    } finally { setBusy(null); }
  };

  const test = async (v: FamilyVoice) => {
    setBusy(v.id); setError(null);
    try {
      const { audioBase64 } = await speakClonedVoice({ data: { voiceId: v.voiceId, text: zh ? `你好，我是${v.label}。` : `Hi, it's ${v.label}.` } });
      playBase64Mp3(audioBase64);
    } catch (e: any) { setError((zh ? "试听失败：" : "Preview failed: ") + (e?.message || "")); }
    finally { setBusy(null); }
  };

  const remove = async (v: FamilyVoice) => {
    setBusy(v.id);
    try { await deleteClonedVoice({ data: { voiceId: v.voiceId } }); } catch { /* still remove locally */ }
    removeFamilyVoice(v.id);
    setBusy(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{zh ? "亲友声音" : "Family Voices"}</h2>
        <p className="text-sm text-muted-foreground">
          {zh ? `为${caredOneName}录下家人的声音。AI 来电时可以用这个声音说话。目前只保存在这台设备上。` : `Record a family member's voice for ${caredOneName}. AI calls can then speak in that voice. Saved on this device only for now.`}
        </p>
      </div>

      <div className="rounded-xl border p-3 space-y-3">
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={zh ? "这是谁的声音，例如：女儿小红" : "Whose voice, e.g. daughter Amy"} />
        <div className="rounded-lg bg-muted/50 p-3 text-sm text-foreground">
          <p className="mb-1 text-xs text-muted-foreground">{zh ? "在安静的地方，用平常的语气朗读（10–20 秒）：" : "In a quiet place, read naturally (10–20 seconds):"}</p>
          {zh ? SAMPLE_ZH : SAMPLE_EN}
        </div>
        {recording ? (
          <Button onClick={() => void stop()} variant="destructive" className="w-full">
            <Square className="h-4 w-4 mr-1" /> {zh ? `停止并复刻（${seconds} 秒）` : `Stop & clone (${seconds}s)`}
          </Button>
        ) : (
          <Button onClick={() => void start()} disabled={busy === "new"} className="w-full">
            {busy === "new" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Mic className="h-4 w-4 mr-1" />}
            {busy === "new" ? (zh ? "正在复刻声音…" : "Cloning voice…") : (zh ? "开始录音" : "Start recording")}
          </Button>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="space-y-2">
        {voices.length === 0 && <p className="text-sm text-muted-foreground">{zh ? "还没有录制的声音。" : "No voices yet."}</p>}
        {voices.map((v) => (
          <div key={v.id} className="flex items-center gap-2 rounded-xl border p-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate">{v.label}</p>
              <p className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleString()}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => void test(v)} disabled={busy === v.id} aria-label={zh ? "试听" : "Preview"}>
              {busy === v.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => void remove(v)} disabled={busy === v.id} aria-label={zh ? "删除" : "Delete"}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
