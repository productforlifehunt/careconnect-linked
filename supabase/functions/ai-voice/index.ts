import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit text length to prevent abuse (roughly 2000 chars max)
    if (text.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Text too long, max 2000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }
    

    // Clean text for speech: strip markdown
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
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const selectedVoice = voice || "alloy";
    const audioFormat = format || "pcm16";

    // Use OpenRouter with GPT Audio Mini - streaming is required for audio output
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-audio-mini",
        messages: [
          {
            role: "system",
            content: "You are a voice synthesis assistant. Repeat the user's text exactly as given, word for word. Do not add, remove, or change anything. Just speak the text naturally.",
          },
          {
            role: "user",
            content: `Please read this text aloud exactly as written:\n\n${cleanText}`,
          },
        ],
        modalities: ["text", "audio"],
        audio: {
          voice: selectedVoice,
          format: audioFormat,
        },
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const errorText = await response.text();
      console.error("OpenRouter audio error:", status, errorText);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits exhausted on OpenRouter. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: `Voice service error [${status}]: ${errorText.slice(0, 200)}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse SSE stream and collect audio chunks
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    const audioChunks: string[] = [];
    const transcriptChunks: string[] = [];
    let textBuffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta;
          const audio = delta?.audio;
          if (audio?.data) audioChunks.push(audio.data);
          if (audio?.transcript) transcriptChunks.push(audio.transcript);
        } catch {
          // partial JSON, skip
        }
      }
    }

    if (audioChunks.length === 0) {
      return new Response(
        JSON.stringify({ error: "No audio generated. The model may not support audio output." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fullAudioBase64 = audioChunks.join("");
    const transcript = transcriptChunks.join("");

    return new Response(
      JSON.stringify({
        audio: fullAudioBase64,
        transcript,
        format: audioFormat,
        voice: selectedVoice,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ai-voice error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
