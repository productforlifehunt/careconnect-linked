// Streaming AI chat for the dementia assistant.
// Returns Server-Sent Events (SSE) — token-by-token deltas — so the frontend
// can detect sentence boundaries and dispatch TTS in parallel.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_PROMPT =
  "You are 小忆AI (XiaoYi AI), a compassionate dementia care assistant for the 忆畅 (ChallengeD) platform. " +
  "Be warm, practical, concise, and safety-first. Never claim to replace a doctor. " +
  "Escalate emergencies immediately. " +
  "Keep replies SHORT — 2 to 4 sentences total. " +
  "End every sentence with proper punctuation (. ! ? 。 ! ?) so streaming TTS can split cleanly. " +
  "SAFETY GUARDRAILS: Never provide financial/investment advice. If the user shares bank card numbers, " +
  "passwords, or sensitive data, gently redirect them to a trusted caregiver. " +
  "For behavioral issues like hallucinations or delusions, use gentle redirection, never argue.";

function buildLanguageRule(language: string | undefined): string {
  switch ((language || "auto").toLowerCase()) {
    case "zh":
    case "zh-cn":
    case "zh-tw":
    case "zh-hk":
      return "ALWAYS respond in Simplified Chinese (中文) only. Do NOT include English translation.";
    case "en":
    case "en-us":
    case "en-gb":
      return "ALWAYS respond in English only. Do NOT include translations in other languages.";
    case "ja":
    case "ja-jp":
      return "ALWAYS respond in Japanese (日本語) only.";
    case "ko":
    case "ko-kr":
      return "ALWAYS respond in Korean (한국어) only.";
    case "auto":
    default:
      return "Detect the language of the user's most recent message and respond in THAT SAME language only. Do NOT add translations in other languages unless the user explicitly asks for them.";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json() as {
      messages: Array<{ role: string; content: string }>;
      language?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages must be a non-empty array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cleaned = messages
      .filter((m) => typeof m?.role === "string" && typeof m?.content === "string")
      .filter((m) => m.role !== "system");

    const systemPrompt = `${BASE_PROMPT}\n\nLANGUAGE RULE: ${buildLanguageRule(language)}`;

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          ...cleaned,
        ],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const status = upstream.status;
      const text = await upstream.text().catch(() => "");
      console.error("AI gateway stream error:", status, text);
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please retry shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ error: `AI gateway error [${status}]` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Pass the gateway SSE stream straight through to the client.
    return new Response(upstream.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("ai-care-stream error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
