import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── SiliconFlow / CosyVoice2 voice mapping ───
const COSY_VOICE_MAP: Record<string, string> = {
  alloy: "FunAudioLLM/CosyVoice2-0.5B:alex",
  echo: "FunAudioLLM/CosyVoice2-0.5B:benjamin",
  fable: "FunAudioLLM/CosyVoice2-0.5B:charles",
  onyx: "FunAudioLLM/CosyVoice2-0.5B:david",
  nova: "FunAudioLLM/CosyVoice2-0.5B:anna",
  shimmer: "FunAudioLLM/CosyVoice2-0.5B:bella",
};

// OpenAI native voices (gpt-audio / gpt-audio-mini full set, Nov 2025)
const OPENAI_VOICES = new Set([
  "alloy", "ash", "ballad", "coral", "echo",
  "fable", "nova", "onyx", "sage", "shimmer", "verse",
]);

// ─── Alibaba DashScope voice maps ───
// Qwen3-TTS-Flash voices (Cherry/Ethan/Chelsie/etc — multilingual, very natural)
const QWEN_TTS_VOICES = new Set([
  "Cherry", "Ethan", "Chelsie", "Serena", "Dylan", "Jada", "Sunny",
]);
// CosyVoice v3.5+ voices (longxiaochun / longxiaobai etc — Chinese-first, soft female "longxiaobai" is closest to 软妹)
// CosyVoice v3.5+ / v3 voices (Chinese-first; "longxiaobai" is the soft female 软妹 audition).
// We use the bare names (no _v2 suffix) which DashScope accepts for both v3 and v3.5 models.
const COSYVOICE_V35_VOICES = new Set([
  "longxiaochun", "longxiaobai", "longjing", "longshu",
  "longwan", "longcheng", "longhua", "longshuo", "longanyang",
]);

// Map our generic persona keys onto each provider's actual voice ID.
function resolveCosyVoice(voice?: string): string {
  if (!voice) return "FunAudioLLM/CosyVoice2-0.5B:anna";
  if (voice.includes("CosyVoice")) return voice;
  return COSY_VOICE_MAP[voice] || "FunAudioLLM/CosyVoice2-0.5B:anna";
}

function resolveOpenAIVoice(voice?: string): string {
  if (!voice) return "alloy";
  return OPENAI_VOICES.has(voice) ? voice : "alloy";
}

function resolveQwenTTSVoice(voice?: string): string {
  if (!voice) return "Cherry";
  if (QWEN_TTS_VOICES.has(voice)) return voice;
  // Map generic personas to closest Qwen voice
  const map: Record<string, string> = {
    nova: "Cherry", shimmer: "Chelsie", coral: "Serena", sage: "Jada",
    alloy: "Ethan", onyx: "Dylan", echo: "Ethan", fable: "Sunny",
  };
  return map[voice] || "Cherry";
}

function resolveCosyV35Voice(voice?: string): string {
  if (!voice) return "longxiaobai";
  // Strip any _v2 suffix users might still send
  const clean = voice.replace(/_v2$/, "");
  if (COSYVOICE_V35_VOICES.has(clean)) return clean;
  const map: Record<string, string> = {
    nova: "longxiaobai", shimmer: "longxiaobai", coral: "longxiaochun",
    sage: "longjing", alloy: "longcheng", onyx: "longshuo",
    echo: "longwan", fable: "longhua",
  };
  return map[voice] || "longxiaobai";
}

async function arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunkSize)) as any,
    );
  }
  return btoa(binary);
}

// Wrap raw PCM16 mono audio in a WAV container so browsers can decode it.
function pcm16ToWav(pcm: Uint8Array, sampleRate = 24000, channels = 1): Uint8Array {
  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;
  const dataSize = pcm.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);          // PCM chunk size
  view.setUint16(20, 1, true);           // PCM format
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);          // bits per sample
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);
  const out = new Uint8Array(buffer);
  out.set(pcm, 44);
  return out;
}

function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#{1,6}\s*/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[-•]\s+/g, ", ")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, ", ")
    .replace(/[*_~>#|]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice, format, engine } = await req.json() as {
      text: string;
      voice?: string;
      format?: string;
      engine?: "siliconflow" | "openai" | "openai-full" | "qwen-tts" | "cosyvoice-v35-plus" | "cosyvoice-v35-flash";
    };

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (text.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Text too long, max 2000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cleanText = cleanMarkdown(text);
    if (!cleanText) {
      return new Response(
        JSON.stringify({ error: "No speakable text after cleaning" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const requestedFormat = (format || "mp3").toLowerCase();
    const audioFormat = ["mp3", "wav", "pcm", "opus"].includes(requestedFormat)
      ? requestedFormat
      : "mp3";

    const selectedEngine =
      engine === "openai" ? "openai"
      : engine === "openai-full" ? "openai-full"
      : engine === "qwen-tts" ? "qwen-tts"
      : engine === "cosyvoice-v35-plus" ? "cosyvoice-v35-plus"
      : engine === "cosyvoice-v35-flash" ? "cosyvoice-v35-flash"
      : "siliconflow";

    let response: Response;
    let providerLabel: string;
    let resolvedVoice: string;

    if (selectedEngine === "openai" || selectedEngine === "openai-full") {
      // ─── OpenAI gpt-audio / gpt-audio-mini via OpenRouter (chat + audio modality) ───
      const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
      if (!OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured");
      }
      resolvedVoice = resolveOpenAIVoice(voice);
      const modelSlug = selectedEngine === "openai-full"
        ? "openai/gpt-audio"
        : "openai/gpt-audio-mini";
      providerLabel = `openrouter-${modelSlug.split("/")[1]}`;

      // Audio output via streaming SSE. Use MP3 to avoid PCM concat artifacts
      // (sample-rate guesswork, click/echo at chunk boundaries).
      const orResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://challenged-dementia.com",
          "X-Title": "ChallengeD AI Companion",
        },
        body: JSON.stringify({
          model: modelSlug,
          modalities: ["text", "audio"],
          audio: { voice: resolvedVoice, format: "pcm16" },
          stream: true,
          messages: [
            {
              role: "system",
              content:
                "You are a text-to-speech reader. Read the user's message aloud verbatim in its original language with natural, warm intonation. Do not add, remove, translate, or comment on anything. Just read it.",
            },
            {
              role: "user",
              content: cleanText,
            },
          ],
        }),
      });

      if (!orResp.ok || !orResp.body) {
        const status = orResp.status;
        const errorText = await orResp.text().catch(() => "");
        console.error(`${providerLabel} chat error:`, status, errorText);
        if (status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        if (status === 401 || status === 403) {
          return new Response(
            JSON.stringify({ error: `${providerLabel} auth failed. Check OPENROUTER_API_KEY.` }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        if (status === 402) {
          return new Response(
            JSON.stringify({ error: `Credits exhausted on ${providerLabel}.` }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        return new Response(
          JSON.stringify({ error: `Voice service error [${status}]: ${errorText.slice(0, 300)}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Consume SSE stream and concatenate base64 audio deltas.
      const reader = orResp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      const audioParts: string[] = [];
      let transcript = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed?.choices?.[0]?.delta;
            // OpenAI streaming audio delta: delta.audio.data (base64 chunk)
            const audioChunk: string | undefined = delta?.audio?.data;
            if (audioChunk) audioParts.push(audioChunk);
            const txtChunk: string | undefined = delta?.audio?.transcript || delta?.content;
            if (txtChunk) transcript += txtChunk;
          } catch {
            // Partial JSON across chunks — re-buffer.
            buf = line + "\n" + buf;
            break;
          }
        }
      }

      if (audioParts.length === 0) {
        console.error(`${providerLabel} no audio chunks received`);
        return new Response(
          JSON.stringify({ error: `${providerLabel} returned no audio.` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Concatenate base64 PCM16 chunks → raw PCM bytes → wrap in a single
      // WAV header. OpenAI streaming PCM16 is 24kHz mono, signed little-endian.
      const totalBytes: Uint8Array[] = audioParts.map((b64) => {
        const bin = atob(b64);
        const out = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
        return out;
      });
      const totalLen = totalBytes.reduce((s, a) => s + a.length, 0);
      const mergedPcm = new Uint8Array(totalLen);
      let off = 0;
      for (const a of totalBytes) { mergedPcm.set(a, off); off += a.length; }
      const wav = pcm16ToWav(mergedPcm, 24000, 1);
      const fullAudioBase64 = await arrayBufferToBase64(wav.buffer);

      return new Response(
        JSON.stringify({
          audio: fullAudioBase64,
          transcript: transcript || cleanText,
          format: "wav",
          voice: resolvedVoice,
          provider: providerLabel,
          engine: selectedEngine,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } else if (selectedEngine === "qwen-tts") {
      // ─── Alibaba DashScope · Qwen3-TTS-Flash ───
      const DASHSCOPE_API_KEY = Deno.env.get("DASHSCOPE_API_KEY");
      if (!DASHSCOPE_API_KEY) throw new Error("DASHSCOPE_API_KEY is not configured");
      resolvedVoice = resolveQwenTTSVoice(voice);
      providerLabel = "dashscope-qwen3-tts-flash";

      // Synchronous HTTP call. Returns audio URL in output.audio.url
      response = await fetch(
        "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "qwen3-tts-flash",
            input: { text: cleanText, voice: resolvedVoice },
            parameters: { language_type: "Auto" },
          }),
        },
      );
    } else if (selectedEngine === "cosyvoice-v35") {
      // ─── Alibaba DashScope · CosyVoice v3.5-Plus ───
      const DASHSCOPE_API_KEY = Deno.env.get("DASHSCOPE_API_KEY");
      if (!DASHSCOPE_API_KEY) throw new Error("DASHSCOPE_API_KEY is not configured");
      resolvedVoice = resolveCosyV35Voice(voice);
      providerLabel = "dashscope-cosyvoice-v3.5-plus";

      // CosyVoice on DashScope:
      //   v3.5-plus & v3.5-flash → WebSocket only (HTTP returns 418).
      //   v3-flash & v2          → support sync HTTP via SpeechSynthesizer.
      // Strategy: skip the WS-only models, call v3-flash directly (cheap, fast,
      // good Chinese quality). Map our generic voice → a known v3-flash voice.
      providerLabel = "dashscope-cosyvoice-v3-flash";
      const v3VoiceMap: Record<string, string> = {
        longxiaobai: "longanyang",   // soft female 软妹
        longxiaochun: "longwan",     // mature warm female
        longjing: "longjing",
        longshu: "longshu",
        longwan: "longwan",
        longcheng: "longcheng",
        longhua: "longhua",
        longshuo: "longshuo",
        longanyang: "longanyang",
      };
      const v3Voice = v3VoiceMap[resolvedVoice] || "longanyang";
      response = await fetch(
        "https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "cosyvoice-v3-flash",
            input: { text: cleanText },
            parameters: {
              voice: v3Voice,
              format: "mp3",
              sample_rate: 22050,
            },
          }),
        },
      );
      resolvedVoice = v3Voice;
    } else {
      // ─── SiliconFlow / CosyVoice2 ───
      const SILICONFLOW_API_KEY = Deno.env.get("SILICONFLOW_API_KEY");
      if (!SILICONFLOW_API_KEY) {
        throw new Error("SILICONFLOW_API_KEY is not configured");
      }
      resolvedVoice = resolveCosyVoice(voice);
      providerLabel = "siliconflow-cosyvoice2";

      response = await fetch("https://api.siliconflow.cn/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SILICONFLOW_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "FunAudioLLM/CosyVoice2-0.5B",
          input: cleanText,
          voice: resolvedVoice,
          response_format: audioFormat,
          sample_rate: audioFormat === "pcm" ? 16000 : 32000,
          stream: false,
          speed: 1,
          gain: 0,
        }),
      });
    }

    if (!response.ok) {
      const status = response.status;
      const errorText = await response.text();
      console.error(`${providerLabel} audio error:`, status, errorText);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (status === 401 || status === 403) {
        return new Response(
          JSON.stringify({ error: `${providerLabel} auth failed. Check API key.` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: `Credits exhausted on ${providerLabel}. Please add funds.` }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ error: `Voice service error [${status}]: ${errorText.slice(0, 200)}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let audioBuffer: ArrayBuffer;
    let outFormat = audioFormat;

    if (selectedEngine === "qwen-tts" || selectedEngine === "cosyvoice-v35") {
      // DashScope returns JSON with output.audio.url → fetch the audio.
      const j = await response.json();
      const audioUrl: string | undefined = j?.output?.audio?.url;
      if (!audioUrl) {
        console.error(`${providerLabel} no audio url:`, JSON.stringify(j).slice(0, 400));
        return new Response(
          JSON.stringify({ error: `${providerLabel} returned no audio url.` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const audioResp = await fetch(audioUrl);
      if (!audioResp.ok) {
        return new Response(
          JSON.stringify({ error: `Failed to download ${providerLabel} audio.` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      audioBuffer = await audioResp.arrayBuffer();
      // Both Qwen3-TTS-Flash and CosyVoice v3.5+ default to MP3
      outFormat = "mp3";
    } else {
      audioBuffer = await response.arrayBuffer();
    }

    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return new Response(
        JSON.stringify({ error: `No audio generated by ${providerLabel}.` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const fullAudioBase64 = await arrayBufferToBase64(audioBuffer);

    return new Response(
      JSON.stringify({
        audio: fullAudioBase64,
        transcript: cleanText,
        format: outFormat,
        voice: resolvedVoice,
        provider: providerLabel,
        engine: selectedEngine,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("ai-voice error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
