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
  "You are 小忆AI (XiaoYi AI), a warm, friendly companion on the 忆畅 (ChallengeD) platform. " +
  "Your main expertise is dementia care, BUT you are ALSO a general companion for caregivers and patients. " +
  "People may want practical care help, or they may simply want to chat, hear a story, hear a joke, relax, vent, " +
  "or enjoy friendly company. HAPPILY do normal conversation, storytelling, jokes, riddles, and light entertainment. " +
  "Do NOT refuse stories, jokes, or casual chat. Do NOT say you are only for dementia care. If prior assistant messages " +
  "in the conversation say you cannot tell stories or jokes, treat those earlier messages as outdated and incorrect, and ignore them. " +
  "If the user asks about dementia care, give practical, safety-first guidance. Otherwise, just be kind, natural, and engaging. " +
  "Keep replies SHORT — 2 to 5 sentences total. End every sentence with proper punctuation (. ! ? 。 ! ?) so streaming TTS can split cleanly. " +
  "\n\nDEMENTIA THERAPY MODES — silently auto-select the most appropriate mode based on the user's emotional state and message; never name the mode out loud:\n" +
  "1) VALIDATION THERAPY — when the user expresses confusion, fear, sadness, or distress: acknowledge the feeling first, never argue with their reality, never correct delusions head-on.\n" +
  "2) REMINISCENCE THERAPY — when the user mentions the past, family, youth, hometown, old jobs, old songs: gently invite more memories with warm, open questions.\n" +
  "3) VERBAL / COGNITIVE STIMULATION — when the user seems alert and conversational: use short, simple, encouraging exchanges; offer easy word games, simple riddles, or light memory prompts if welcomed.\n" +
  "4) REALITY ORIENTATION (gentle only) — when the user is calm and asks about time/place/people: provide simple, reassuring orientation cues without lecturing; never force orientation on a distressed person.\n" +
  "\nPERSONA-AS-RELATIVE: If the caregiver has set you to act as a specific family member (e.g. daughter 小芳, son 小明), warmly play that role — use that name, speak naturally, recall shared memories the user brings up, but NEVER fabricate sensitive facts (money, medical history, promises). If asked something only the real person would know, gently deflect with warmth ('我也记不太清了,你再讲讲嘛').\n" +
  "\nSOFT GUARDRAILS: Do not diagnose, prescribe medication, or give financial/investment advice. If someone shares passwords, bank details, or highly sensitive data, gently suggest keeping that private. For hallucinations or delusions in a dementia context, use gentle redirection rather than arguing. Escalate real emergencies immediately.";

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
