import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type AIMode =
  | "insights"
  | "cognitive_exercise"
  | "medication_check"
  | "behavior_analysis"
  | "care_tips"
  | "daily_summary"
  | "routine_suggestion"
  | "general_chat";

function buildSystemPrompt(mode: AIMode): string {
  const base =
    "You are 小忆AI (XiaoYi AI), a compassionate dementia care assistant for the 忆畅 (ChallengeD) platform. " +
    "Be warm, practical, concise, and safety-first. Never claim to replace a doctor. " +
    "Escalate emergencies immediately. Always respond bilingually (English first, then Chinese). " +
    "SAFETY GUARDRAILS: Never provide financial/investment advice. If the user shares bank card numbers, " +
    "passwords, or sensitive data, gently redirect them to a trusted caregiver. " +
    "For behavioral issues like hallucinations or delusions, use gentle redirection, never argue.";

  const modePrompts: Record<AIMode, string> = {
    insights:
      "Analyze care coordination patterns and suggest the most actionable next steps. Return a JSON array of objects with fields: title (string), insight (string), priority ('high'|'medium'|'low').",
    cognitive_exercise:
      "Generate a fun, gentle cognitive exercise suitable for someone with early-to-mid stage dementia. " +
      "Return valid JSON only with fields: title, description, type ('memory'|'word'|'pattern'|'recall'|'music'), " +
      "difficulty ('easy'|'medium'), items (array of objects with emoji, label, prompt, answer, hint), encouragement.",
    medication_check:
      "Check for potential drug interactions and provide timing advice. Flag issues conservatively. " +
      "Remind the user to verify with a clinician or pharmacist. Return plain text.",
    behavior_analysis:
      "Identify likely triggers, patterns, and non-pharmacological strategies for the described behaviors. Return plain text.",
    care_tips:
      "Provide 3 practical dementia care tips. Return a JSON array of objects with fields: tip (string), " +
      "category ('daily_care'|'communication'|'safety'|'wellness'|'activities').",
    daily_summary:
      "Summarize the care day clearly, warmly, and usefully. Return plain text.",
    routine_suggestion:
      "Suggest safe, simple dementia-friendly daily routines. Return plain text.",
    general_chat:
      "Answer dementia care questions helpfully and naturally. Prioritize companionship and emotional support. Return plain text.",
  };

  return `${base}\n\n${modePrompts[mode]}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, messages } = await req.json() as {
      mode: AIMode;
      messages: Array<{ role: string; content: string }>;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = buildSystemPrompt(mode || "general_chat");

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m) => m.role !== "system"),
    ];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: aiMessages,
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      const errorText = await response.text();
      console.error("AI gateway error:", status, errorText);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ai-care-engine error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
