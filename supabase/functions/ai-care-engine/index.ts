import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  insights: `You are CareAI, a dementia care intelligence system. Given a patient's current data (medications, check-ins, tasks, location status), generate 3-4 brief, actionable care insights. Each insight should be 1-2 sentences. Format as a JSON array of objects with "title" (short heading), "insight" (the advice), and "priority" ("high"|"medium"|"low"). Focus on:
- Medication adherence patterns
- Behavioral changes that need attention
- Upcoming care needs
- Caregiver wellness reminders
Return ONLY valid JSON, no markdown fences.`,

  cognitive_exercise: `You are a cognitive exercise designer for people with dementia. Generate ONE interactive cognitive exercise. Return a JSON object with:
- "title": exercise name (fun, non-clinical)
- "description": simple 1-sentence instruction
- "type": "memory"|"word"|"pattern"|"recall"|"music"
- "difficulty": "easy"|"medium" (never hard for dementia patients)
- "items": array of 4-6 exercise items. For memory: objects with "emoji" and "label". For word: objects with "prompt" and "answer". For pattern: objects with "sequence" (string) and "answer" (string). For recall: objects with "question" and "hint".
- "encouragement": a warm, positive message to show after completion
Return ONLY valid JSON, no markdown fences.`,

  medication_check: `You are a medication safety assistant. Given a list of medications, identify potential interactions, side effects to watch for, and timing recommendations. Be concise and practical. Always remind that a pharmacist or doctor should confirm. Format response as clear bullet points.`,

  behavior_analysis: `You are a dementia behavior analyst. Given behavioral observations (mood, agitation, sleep, wandering), identify patterns and provide actionable recommendations. Consider sundowning, environmental triggers, and communication strategies. Be compassionate and practical. Format as 2-3 short paragraphs.`,

  care_tips: `You are a personalized dementia care coach. Based on the patient's current stage and recent care data, provide 3 specific, actionable tips. Each tip should be 1-2 sentences, warm and encouraging. Format as a JSON array of objects with "tip" and "category" ("daily_care"|"communication"|"safety"|"wellness"|"activities"). Return ONLY valid JSON, no markdown fences.`,

  daily_summary: `You are a care day summarizer. Given today's care activities, medications, check-ins, and tasks, write a brief 3-4 sentence summary of how the day went. Highlight what was completed, what needs attention, and a positive note. Be warm and professional.`,

  routine_suggestion: `You are a dementia routine optimizer. Given a patient's current daily schedule and dementia stage, suggest improvements to their routine that promote cognitive engagement, reduce agitation, and maintain circadian rhythm. Return a JSON array of objects with "time" (e.g. "9:00 AM"), "activity", "rationale" (1 sentence why this helps), and "duration_minutes". Return ONLY valid JSON, no markdown fences.`,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { mode, context, messages } = await req.json();

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.care_tips;

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...(context ? [{ role: "user", content: context }] : []),
      ...(messages || []),
    ];

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it",
        messages: chatMessages,
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", response.status, errText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded", reply: "AI is busy. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required", reply: "AI credits depleted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`OpenRouter responded with ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Unable to generate response.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in ai-care-engine:", err);
    return new Response(
      JSON.stringify({ error: err.message, reply: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
