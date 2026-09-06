import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { TTS_READER_SYSTEM_PROMPT } from "../_shared/ai-prompts.ts";

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
// CosyVoice v3-plus voice list (per Alibaba docs — only 2 standard voices).
// Source: https://help.aliyun.com/zh/model-studio/cosyvoice-voice-list
const COSYVOICE_V3_PLUS_VOICES = new Set([
  "longanyang",  // 龙安洋 — 阳光大男孩 (sunny young man)
  "longanhuan",  // 龙安欢 — 欢脱元气女 (lively energetic girl)
]);

// CosyVoice v3-flash voice list (subset of the most useful soft/natural voices).
// All v3-flash voices use the "_v3" suffix.
const COSYVOICE_V3_FLASH_VOICES = new Set([
  "longwan_v3",       // 龙婉 — 细腻柔声女 (delicate soft female) ← softest
  "longanrou_v3",     // 龙安柔 — 温柔闺蜜女 (gentle bestie female)
  "longxiaochun_v3",  // 龙小淳 — 知性积极女
  "longxiaoxia_v3",   // 龙小夏 — 沉稳权威女
  "longanwen_v3",     // 龙安温 — 优雅知性女
  "longanya_v3",      // 龙安雅 — 高雅气质女
  "longanling_v3",    // 龙安灵 — 思维灵动女
  "longyingling_v3",  // 龙应聆 — 温和共情女
  "longyingtao_v3",   // 龙应桃 — 温柔淡定女
  "longhua_v3",       // 龙华 — 元气甜美女
  "longxing_v3",      // 龙星 — 温婉邻家女
  "longyan_v3",       // 龙颜 — 温暖春风女
  "longyumi_v3",      // YUMI — 正经青年女
  "longantai_v3",     // 龙安台 — 嗲甜台湾女
  "longfeifei_v3",    // 龙菲菲 — 甜美娇气女
  "longanyun_v3",     // 龙安昀 — 居家暖男
  "longanlang_v3",    // 龙安朗 — 清爽利落男
  "longze_v3",        // 龙泽 — 温暖元气男
  "longcheng_v3",     // 龙橙 — 智慧青年男
  "longtian_v3",      // 龙天 — 磁性理智男
  "longshu_v3",       // 龙书 — 沉稳青年男
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

// Model-aware resolver. v3-plus only has 2 voices, v3-flash has many.
function resolveCosyV3Voice(voice: string | undefined, model: string): string {
  const isPlus = model === "cosyvoice-v3-plus";
  const allowed = isPlus ? COSYVOICE_V3_PLUS_VOICES : COSYVOICE_V3_FLASH_VOICES;
  const fallback = isPlus ? "longanhuan" : "longwan_v3"; // softest natural female
  if (!voice) return fallback;
  if (allowed.has(voice)) return voice;
  // Map generic OpenAI personas to closest matching voice.
  const mapPlus: Record<string, string> = {
    nova: "longanhuan", shimmer: "longanhuan", coral: "longanhuan",
    sage: "longanhuan", fable: "longanhuan",
    alloy: "longanyang", onyx: "longanyang", echo: "longanyang",
    ash: "longanyang", ballad: "longanyang", verse: "longanyang",
  };
  const mapFlash: Record<string, string> = {
    nova: "longwan_v3", shimmer: "longanrou_v3", coral: "longyingling_v3",
    sage: "longxiaoxia_v3", fable: "longhua_v3",
    alloy: "longcheng_v3", onyx: "longtian_v3", echo: "longshu_v3",
    ash: "longanyun_v3", ballad: "longanlang_v3", verse: "longze_v3",
  };
  const map = isPlus ? mapPlus : mapFlash;
  return map[voice] || fallback;
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

/**
 * Synthesize speech via Alibaba DashScope CosyVoice WebSocket API.
 * Used for cosyvoice-v3.5-plus and cosyvoice-v3.5-flash (HTTP-only models reject these).
 *
 * Protocol:
 *   1. Open wss://dashscope.aliyuncs.com/api-ws/v1/inference with bearer auth header.
 *   2. Send `run-task` JSON event (configures voice/format/sample_rate).
 *   3. Wait for `task-started` JSON event.
 *   4. Send `continue-task` JSON event with the text to synthesize.
 *   5. Send `finish-task` JSON event to flush.
 *   6. Receive binary audio frames + final `task-finished` event.
 *   7. Concatenate binary frames → return as a single audio buffer.
 */
async function cosyVoiceWebSocket(opts: {
  apiKey: string;
  model: string;        // "cosyvoice-v3.5-plus" | "cosyvoice-v3.5-flash"
  voice: string;
  text: string;
  format?: string;      // "mp3" | "wav" | "pcm"
  sampleRate?: number;
}): Promise<{ audio: Uint8Array; format: string }> {
  const fmt = (opts.format || "mp3").toLowerCase();
  const sr = opts.sampleRate || 22050;
  const taskId = crypto.randomUUID().replace(/-/g, "");

  // Manual WebSocket over TLS — Supabase Edge Runtime's stock WebSocket cannot
  // set custom request headers, and DashScope rejects auth via query/subprotocol.
  // We open a raw TLS socket to dashscope.aliyuncs.com:443, perform the HTTP
  // Upgrade handshake with Authorization: bearer <key>, then frame WS messages
  // ourselves (RFC 6455).

  const HOST = "dashscope.aliyuncs.com";
  const PATH = "/api-ws/v1/inference/";
  const conn = await Deno.connectTls({ hostname: HOST, port: 443 });

  // ── 1. WebSocket handshake ──
  const wsKey = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))),
  );
  const handshake =
    `GET ${PATH} HTTP/1.1\r\n` +
    `Host: ${HOST}\r\n` +
    `Upgrade: websocket\r\n` +
    `Connection: Upgrade\r\n` +
    `Sec-WebSocket-Key: ${wsKey}\r\n` +
    `Sec-WebSocket-Version: 13\r\n` +
    `Authorization: bearer ${opts.apiKey}\r\n` +
    `X-DashScope-DataInspection: enable\r\n` +
    `\r\n`;
  await conn.write(new TextEncoder().encode(handshake));

  // Read until end of headers (\r\n\r\n)
  const handshakeBuf = new Uint8Array(8192);
  let hsLen = 0;
  let bodyStart = -1;
  while (bodyStart < 0 && hsLen < handshakeBuf.length) {
    const n = await conn.read(handshakeBuf.subarray(hsLen));
    if (n === null) throw new Error("CosyVoice WS handshake EOF");
    hsLen += n;
    const s = new TextDecoder().decode(handshakeBuf.subarray(0, hsLen));
    const idx = s.indexOf("\r\n\r\n");
    if (idx >= 0) bodyStart = idx + 4;
  }
  const respText = new TextDecoder().decode(handshakeBuf.subarray(0, bodyStart));
  if (!/^HTTP\/1\.1 101/i.test(respText)) {
    throw new Error(`CosyVoice WS handshake failed: ${respText.split("\r\n")[0]}`);
  }
  // Anything after bodyStart is start of WS frames
  let leftover = handshakeBuf.subarray(bodyStart, hsLen).slice();

  // ── 2. WebSocket framing helpers ──
  const sendFrame = async (payload: Uint8Array, opcode: number) => {
    const len = payload.length;
    const mask = crypto.getRandomValues(new Uint8Array(4));
    let header: Uint8Array;
    if (len < 126) {
      header = new Uint8Array(2 + 4);
      header[0] = 0x80 | opcode;
      header[1] = 0x80 | len;
      header.set(mask, 2);
    } else if (len < 65536) {
      header = new Uint8Array(4 + 4);
      header[0] = 0x80 | opcode;
      header[1] = 0x80 | 126;
      header[2] = (len >> 8) & 0xff;
      header[3] = len & 0xff;
      header.set(mask, 4);
    } else {
      header = new Uint8Array(10 + 4);
      header[0] = 0x80 | opcode;
      header[1] = 0x80 | 127;
      // 64-bit length, JS limits to 32-bit
      for (let i = 0; i < 4; i++) header[2 + i] = 0;
      header[6] = (len >>> 24) & 0xff;
      header[7] = (len >>> 16) & 0xff;
      header[8] = (len >>> 8) & 0xff;
      header[9] = len & 0xff;
      header.set(mask, 10);
    }
    const masked = new Uint8Array(len);
    for (let i = 0; i < len; i++) masked[i] = payload[i] ^ mask[i & 3];
    const frame = new Uint8Array(header.length + masked.length);
    frame.set(header, 0);
    frame.set(masked, header.length);
    await conn.write(frame);
  };

  const sendText = (s: string) =>
    sendFrame(new TextEncoder().encode(s), 0x1);

  // Read exactly N bytes (may consume from `leftover` first)
  const readExact = async (n: number): Promise<Uint8Array> => {
    const out = new Uint8Array(n);
    let off = 0;
    if (leftover.length > 0) {
      const take = Math.min(n, leftover.length);
      out.set(leftover.subarray(0, take), 0);
      leftover = leftover.subarray(take);
      off = take;
    }
    while (off < n) {
      const r = await conn.read(out.subarray(off));
      if (r === null) throw new Error("CosyVoice WS unexpected EOF");
      off += r;
    }
    return out;
  };

  // Read one full message (handles fragmentation, control frames)
  const readMessage = async (): Promise<{ opcode: number; data: Uint8Array }> => {
    const fragments: Uint8Array[] = [];
    let firstOp = -1;
    while (true) {
      const h = await readExact(2);
      const fin = (h[0] & 0x80) !== 0;
      const op = h[0] & 0x0f;
      const masked = (h[1] & 0x80) !== 0;
      let len = h[1] & 0x7f;
      if (len === 126) {
        const ext = await readExact(2);
        len = (ext[0] << 8) | ext[1];
      } else if (len === 127) {
        const ext = await readExact(8);
        // JS safe: take low 32 bits
        len = (ext[4] << 24) | (ext[5] << 16) | (ext[6] << 8) | ext[7];
      }
      if (masked) await readExact(4); // server should not mask, but handle anyway
      const payload = len > 0 ? await readExact(len) : new Uint8Array(0);

      if (op === 0x9) { // ping → pong
        await sendFrame(payload, 0xa);
        continue;
      }
      if (op === 0xa) continue; // pong, ignore
      if (op === 0x8) { // close
        return { opcode: 0x8, data: payload };
      }
      if (firstOp < 0) firstOp = op;
      fragments.push(payload);
      if (fin) {
        const total = fragments.reduce((s, f) => s + f.length, 0);
        const merged = new Uint8Array(total);
        let off = 0;
        for (const f of fragments) { merged.set(f, off); off += f.length; }
        return { opcode: firstOp, data: merged };
      }
    }
  };

  // ── 3. Send run-task ──
  await sendText(JSON.stringify({
    header: { action: "run-task", task_id: taskId, streaming: "duplex" },
    payload: {
      task_group: "audio",
      task: "tts",
      function: "SpeechSynthesizer",
      model: opts.model,
      parameters: {
        text_type: "PlainText",
        voice: opts.voice,
        format: fmt,
        sample_rate: sr,
        volume: 50,
        rate: 1,
        pitch: 1,
        enable_ssml: false,
      },
      input: {},
    },
  }));

  // ── 4. Event loop ──
  const audioChunks: Uint8Array[] = [];
  let started = false;
  let finished = false;

  const deadline = Date.now() + 30000;
  while (!finished && Date.now() < deadline) {
    const msg = await readMessage();
    if (msg.opcode === 0x8) break; // close
    if (msg.opcode === 0x1) {
      // text → JSON event
      const text = new TextDecoder().decode(msg.data);
      let parsed: any;
      try { parsed = JSON.parse(text); } catch { continue; }
      const event = parsed?.header?.event;
      if (event === "task-started") {
        started = true;
        await sendText(JSON.stringify({
          header: { action: "continue-task", task_id: taskId, streaming: "duplex" },
          payload: { input: { text: opts.text } },
        }));
        await sendText(JSON.stringify({
          header: { action: "finish-task", task_id: taskId, streaming: "duplex" },
          payload: { input: {} },
        }));
      } else if (event === "task-finished") {
        finished = true;
      } else if (event === "task-failed") {
        const m = parsed?.header?.error_message || parsed?.header?.error_code || "task-failed";
        try { conn.close(); } catch { /* ignore */ }
        throw new Error(`CosyVoice WS task-failed: ${m}`);
      }
    } else if (msg.opcode === 0x2) {
      // binary → audio chunk
      audioChunks.push(msg.data);
    }
  }

  try { conn.close(); } catch { /* ignore */ }

  if (!started) throw new Error("CosyVoice WS closed before task-started");
  if (audioChunks.length === 0) throw new Error("CosyVoice WS produced no audio");

  const total = audioChunks.reduce((s, c) => s + c.length, 0);
  const merged = new Uint8Array(total);
  let off = 0;
  for (const c of audioChunks) { merged.set(c, off); off += c.length; }
  return { audio: merged, format: fmt };
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
      engine?: "lovable" | "siliconflow" | "openai" | "openai-full" | "qwen-tts" | "cosyvoice-v35-plus" | "cosyvoice-v35-flash";
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
      : engine === "siliconflow" && Deno.env.get("SILICONFLOW_API_KEY") ? "siliconflow"
      // No engine requested (or SiliconFlow key absent) → built-in Lovable AI voice
      : Deno.env.get("SILICONFLOW_API_KEY") ? "siliconflow"
      : "lovable";

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
              content: TTS_READER_SYSTEM_PROMPT,
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
    } else if (
      selectedEngine === "cosyvoice-v35-plus" ||
      selectedEngine === "cosyvoice-v35-flash"
    ) {
      // ─── Alibaba DashScope · CosyVoice v3.5+ (WebSocket-only) ───
      const DASHSCOPE_API_KEY = Deno.env.get("DASHSCOPE_API_KEY");
      if (!DASHSCOPE_API_KEY) throw new Error("DASHSCOPE_API_KEY is not configured");
      const model = selectedEngine === "cosyvoice-v35-plus"
        ? "cosyvoice-v3-plus"
        : "cosyvoice-v3-flash";
      resolvedVoice = resolveCosyV3Voice(voice, model);
      providerLabel = `dashscope-${model}`;

      try {
        const { audio: wsAudio, format: wsFmt } = await cosyVoiceWebSocket({
          apiKey: DASHSCOPE_API_KEY,
          model,
          voice: resolvedVoice,
          text: cleanText,
          format: "mp3",
          sampleRate: 22050,
        });
        const audioBase64 = await arrayBufferToBase64(wsAudio.buffer);
        return new Response(
          JSON.stringify({
            audio: audioBase64,
            transcript: cleanText,
            format: wsFmt,
            voice: resolvedVoice,
            provider: providerLabel,
            engine: selectedEngine,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`${providerLabel} WS error:`, msg);
        return new Response(
          JSON.stringify({ error: `${providerLabel} failed: ${msg}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    } else if (selectedEngine === "lovable") {
      // ─── Built-in Lovable AI voice (no third-party key required) ───
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        throw new Error("LOVABLE_API_KEY is not configured");
      }
      resolvedVoice = voice && /^[A-Z][a-z]+$/.test(voice) ? voice : "Kore";
      providerLabel = "lovable-gemini-tts";

      const ttsResp = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-tts",
          contents: [{ role: "user", parts: [{ text: cleanText }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: resolvedVoice } },
            },
          },
        }),
      });

      if (!ttsResp.ok) {
        const errText = await ttsResp.text();
        console.error("lovable tts error:", ttsResp.status, errText);
        return new Response(
          JSON.stringify({ error: "Voice is temporarily unavailable. Please try again." }),
          { status: ttsResp.status === 429 ? 429 : 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const wavBuf = await ttsResp.arrayBuffer();
      const audioBase64 = await arrayBufferToBase64(wavBuf);
      return new Response(
        JSON.stringify({
          audio: audioBase64,
          transcript: cleanText,
          format: "wav",
          voice: resolvedVoice,
          provider: providerLabel,
          engine: selectedEngine,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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

    if (selectedEngine === "qwen-tts") {
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
