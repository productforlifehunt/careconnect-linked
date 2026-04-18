import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map legacy OpenAI voice names → CosyVoice2 voice IDs
const VOICE_MAP: Record<string, string> = {
  alloy: "FunAudioLLM/CosyVoice2-0.5B:alex",
  echo: "FunAudioLLM/CosyVoice2-0.5B:benjamin",
  fable: "FunAudioLLM/CosyVoice2-0.5B:charles",
  onyx: "FunAudioLLM/CosyVoice2-0.5B:david",
  nova: "FunAudioLLM/CosyVoice2-0.5B:anna",
  shimmer: "FunAudioLLM/CosyVoice2-0.5B:bella",
};

function resolveVoice(voice?: string): string {
  if (!voice) return "FunAudioLLM/CosyVoice2-0.5B:anna";
  if (voice.includes("CosyVoice")) return voice;
  return VOICE_MAP[voice] || "FunAudioLLM/CosyVoice2-0.5B:anna";
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice, format } = await req.json() as {
      text: string;
      voice?: string;
      format?: string;
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

    const SILICONFLOW_API_KEY = Deno.env.get("SILICONFLOW_API_KEY");
    if (!SILICONFLOW_API_KEY) {
      throw new Error("SILICONFLOW_API_KEY is not configured");
    }

    // Clean markdown for natural speech
    const cleanText = text
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

    if (!cleanText) {
      return new Response(
        JSON.stringify({ error: "No speakable text after cleaning" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const selectedVoice = resolveVoice(voice);
    // SiliconFlow supports: mp3, wav, pcm, opus
    const requestedFormat = (format || "mp3").toLowerCase();
    const audioFormat = ["mp3", "wav", "pcm", "opus"].includes(requestedFormat)
      ? requestedFormat
      : "mp3";

    const response = await fetch("https://api.siliconflow.cn/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SILICONFLOW_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "FunAudioLLM/CosyVoice2-0.5B",
        input: cleanText,
        voice: selectedVoice,
        response_format: audioFormat,
        sample_rate: audioFormat === "pcm" ? 16000 : 32000,
        stream: false,
        speed: 1,
        gain: 0,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const errorText = await response.text();
      console.error("SiliconFlow audio error:", status, errorText);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (status === 401 || status === 403) {
        return new Response(
          JSON.stringify({ error: "SiliconFlow auth failed. Check SILICONFLOW_API_KEY." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits exhausted on SiliconFlow. Please add funds." }),
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
        JSON.stringify({ error: "No audio generated by SiliconFlow." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const fullAudioBase64 = await arrayBufferToBase64(audioBuffer);

    return new Response(
      JSON.stringify({
        audio: fullAudioBase64,
        transcript: cleanText,
        format: audioFormat,
        voice: selectedVoice,
        provider: "siliconflow-cosyvoice2",
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
