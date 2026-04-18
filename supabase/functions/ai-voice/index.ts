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

// OpenAI TTS expects one of: alloy, echo, fable, onyx, nova, shimmer (already aligned)
const OPENAI_VOICES = new Set(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]);

function resolveCosyVoice(voice?: string): string {
  if (!voice) return "FunAudioLLM/CosyVoice2-0.5B:anna";
  if (voice.includes("CosyVoice")) return voice;
  return COSY_VOICE_MAP[voice] || "FunAudioLLM/CosyVoice2-0.5B:anna";
}

function resolveOpenAIVoice(voice?: string): string {
  if (!voice) return "nova";
  return OPENAI_VOICES.has(voice) ? voice : "nova";
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
      engine?: "siliconflow" | "openai";
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

    const selectedEngine = engine === "openai" ? "openai" : "siliconflow";

    let response: Response;
    let providerLabel: string;
    let resolvedVoice: string;

    if (selectedEngine === "openai") {
      // ─── OpenAI gpt-audio-mini via OpenRouter (chat completions + audio modality) ───
      const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
      if (!OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured");
      }
      resolvedVoice = resolveOpenAIVoice(voice);
      providerLabel = "openrouter-gpt-audio-mini";

      // gpt-audio-mini outputs wav natively; we transcode label only.
      const orResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://challenged-dementia.com",
          "X-Title": "ChallengeD AI Companion",
        },
        body: JSON.stringify({
          model: "openai/gpt-audio-mini",
          modalities: ["text", "audio"],
          audio: { voice: resolvedVoice, format: "wav" },
          messages: [
            {
              role: "system",
              content:
                "You are a text-to-speech engine. Read the user's message aloud verbatim, with natural intonation. Do NOT add commentary, greetings, or any extra words. Output only the spoken audio of the exact text provided.",
            },
            { role: "user", content: cleanText },
          ],
        }),
      });

      if (!orResp.ok) {
        const status = orResp.status;
        const errorText = await orResp.text();
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

      const orData = await orResp.json();
      // OpenAI/OpenRouter audio response shape: choices[0].message.audio.data (base64 wav)
      const audioB64: string | undefined = orData?.choices?.[0]?.message?.audio?.data;
      if (!audioB64) {
        console.error(`${providerLabel} no audio in response:`, JSON.stringify(orData).slice(0, 500));
        return new Response(
          JSON.stringify({ error: `${providerLabel} returned no audio. Response shape unexpected.` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({
          audio: audioB64,
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

    const audioBuffer = await response.arrayBuffer();
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
        format: audioFormat,
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
