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
  | "care_info_sheet"
  | "general_chat";

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

function buildFallbackReply(mode: AIMode): string {
  switch (mode) {
    case "insights":
      return JSON.stringify([
        {
          title: "Temporary connection issue",
          insight: "AI insights are temporarily unavailable, so review recent check-ins, medications, and tasks manually for now.",
          priority: "medium",
        },
      ]);
    case "cognitive_exercise":
      return JSON.stringify({
        title: "Photo Memory Match",
        description: "Look at a familiar photo together and name the person, place, or memory connected to it.",
        type: "memory",
        difficulty: "easy",
        items: [
          {
            emoji: "📷",
            label: "Family photo",
            prompt: "Who is in this photo and what happy moment do you remember?",
            answer: "Any familiar name or memory is a good answer.",
            hint: "Start with one familiar face or one place you remember.",
          },
        ],
        encouragement: "Gentle recall is enough — celebrate any small memory that comes up.",
      });
    case "care_tips":
      return JSON.stringify([
        {
          tip: "Keep the daily routine calm and predictable to reduce confusion.",
          category: "daily_care",
        },
        {
          tip: "Use short, reassuring sentences and give one instruction at a time.",
          category: "communication",
        },
        {
          tip: "Check for fall risks, hydration, and medication timing throughout the day.",
          category: "safety",
        },
      ]);
    case "medication_check":
      return "AI medication review is temporarily unavailable. Please double-check dosing times, avoid changing medications without a clinician, and verify possible interactions with a pharmacist.\n\nAI药物检查暂时不可用。请再次确认服药时间，不要自行调整药物，并向医生或药师核实相互作用。";
    case "behavior_analysis":
      return "AI behavior analysis is temporarily unavailable. For now, look for triggers such as pain, hunger, noise, fatigue, or overstimulation, and respond with reassurance and a calmer environment.\n\nAI行为分析暂时不可用。当前可先检查疼痛、饥饿、噪音、疲劳或刺激过多等诱因，并用安抚和更平静的环境来应对。";
    case "daily_summary":
      return "Daily summary is temporarily unavailable. Please review today's meals, medications, mood changes, mobility, sleep, and check-ins manually.\n\n每日报告暂时不可用。请先手动查看今天的饮食、用药、情绪变化、活动情况、睡眠和签到记录。";
    case "routine_suggestion":
      return "Routine suggestions are temporarily unavailable. A safe default is: gentle morning hygiene, hydration, medication check, one simple activity, quiet rest, and a calm evening routine.\n\n日常建议暂时不可用。安全的默认安排是：早晨轻柔洗漱、补水、检查用药、一个简单活动、安静休息，以及平静的晚间流程。";
    case "general_chat":
    default:
      return "I’m temporarily having trouble reaching the AI service, but I’m still here to help with calm, practical dementia-care guidance. Please try again in a moment.\n\n我暂时无法连接到AI服务，但仍可以继续提供冷静、实用的认知障碍照护建议。请稍后再试。";
  }
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

function buildSystemPrompt(mode: AIMode): string {
  const base =
    "You are 小忆AI (XiaoYi AI), a warm, friendly companion on the 忆畅 (ChallengeD) platform. " +
    "Your main expertise is dementia care, BUT you are ALSO a general companion: caregivers and patients " +
    "get tired, lonely, and stressed — they may just want to chat, hear a story, hear a joke, talk about " +
    "the weather, hobbies, food, music, travel, history, or anything else. ALWAYS happily engage with " +
    "casual conversation, storytelling, jokes, riddles, small talk, and emotional support. NEVER refuse " +
    "to tell a story or a joke. NEVER lecture the user that you are 'only' a dementia care AI. " +
    "If the user asks about dementia care, give practical, safety-first guidance. Otherwise, just be a " +
    "kind, fun, present friend. Keep answers natural and concise. Respond in the user's language " +
    "(if they write in Chinese, reply in Chinese; if English, reply in English; if mixed, mirror them). " +
    "SOFT GUARDRAILS (only when actually relevant): don't give medical diagnoses or prescribe medication " +
    "(suggest consulting a clinician), don't give financial/investment advice, and if someone shares " +
    "passwords or bank details gently suggest keeping those private. For hallucinations or delusions in " +
    "a dementia context, use gentle redirection rather than arguing. Escalate real emergencies immediately.";

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
    care_info_sheet:
      "Answer only the current user's question using facts explicitly included in the user's latest message under 'Known sheet facts'. Never invent, infer, or fill in missing details. If the answer is not in those facts, say that it is not written on this sheet and suggest contacting a listed contact. Keep it short and plain-spoken. Do not give a diagnosis, medication instructions, or legal/financial advice. Return plain text.",
    general_chat:

      "Chat naturally and warmly. Happily tell stories, jokes, riddles, fun facts, or just listen and reply with empathy when asked. " +
      "Treat the user as a friend, not a patient. Only bring up dementia-care topics when the user actually asks. Return plain text.",
  };

  return `${base}\n\n${modePrompts[mode]}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json() as {
      mode: AIMode;
      messages: Array<{ role: string; content: string }>;
    };

    const mode = normalizeMode(payload?.mode);
    const messages = Array.isArray(payload?.messages)
      ? payload.messages.filter((m) => typeof m?.role === "string" && typeof m?.content === "string")
      : [];

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages must be a non-empty array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ reply: buildFallbackReply(mode), degraded: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = buildSystemPrompt(mode);

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m) => m.role !== "system"),
    ];

    const reply = await requestAIReply(LOVABLE_API_KEY, aiMessages);

    return new Response(
      JSON.stringify({ reply: reply || buildFallbackReply(mode), degraded: !reply }),
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
