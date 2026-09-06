import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildFallbackReply, buildSystemPrompt, type AIMode } from "../_shared/ai-prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_MODELS = ["google/gemini-3-flash-preview", "google/gemini-2.5-flash"] as const;
const VALID_MODES = new Set<AIMode>([
  "insights",
  "cognitive_exercise",
  "medication_check",
  "behavior_analysis",
  "care_tips",
  "daily_summary",
  "routine_suggestion",
  "care_info_sheet",
  "general_chat",
]);


function normalizeMode(value: unknown): AIMode {
  return VALID_MODES.has(value as AIMode) ? (value as AIMode) : "general_chat";
}

async function requestAIReply(apiKey: string, messages: Array<{ role: string; content: string }>) {
  for (const model of AI_MODELS) {
    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
        }),
      });

      if (!response.ok) {
        console.error("AI gateway error:", model, response.status, await response.text());
        continue;
      }

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (typeof reply === "string" && reply.trim()) {
        return reply;
      }
    } catch (error) {
      console.error("AI gateway request failed:", model, error);
    }
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json() as {
      mode: AIMode;
      messages: Array<{ role: string; content: string }>;
      contextPrompt?: string;
      language?: string;
    };

    const mode = normalizeMode(payload?.mode);
    const messages = Array.isArray(payload?.messages)
      ? payload.messages.filter((m) => typeof m?.role === "string" && typeof m?.content === "string")
      : [];
    const contextPrompt = typeof payload?.contextPrompt === "string"
      ? payload.contextPrompt.slice(0, 8000).trim()
      : "";

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages must be a non-empty array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ reply: buildFallbackReply(mode, payload?.language), degraded: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = [buildSystemPrompt(mode, payload?.language), contextPrompt].filter(Boolean).join("\n\n");

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m) => m.role !== "system"),
    ];

    const reply = await requestAIReply(LOVABLE_API_KEY, aiMessages);

    return new Response(
      JSON.stringify({ reply: reply || buildFallbackReply(mode, payload?.language), degraded: !reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ai-care-engine error:", e);
    return new Response(
      JSON.stringify({ reply: buildFallbackReply("general_chat"), degraded: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
