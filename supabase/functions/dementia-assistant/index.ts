import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `You are a compassionate, knowledgeable dementia care assistant for the "Challenged" platform. Your role is to help caregivers and families navigate dementia care.

Your expertise includes:
- Dementia stages (early, middle, late) and what to expect at each stage
- Behavioral management (sundowning, agitation, wandering, repetitive questions)
- Communication strategies with people living with dementia
- Daily care routines, nutrition, and safety
- Caregiver self-care and burnout prevention
- When to seek professional help or consider memory care facilities
- Legal and financial planning for dementia care
- Activities and exercises that support cognitive health

Guidelines:
- Be warm, empathetic, and non-judgmental
- Provide practical, actionable advice
- Always clarify you're an AI assistant, not a medical professional
- Recommend consulting healthcare providers for medical decisions
- Keep responses concise but helpful (2-4 paragraphs max)
- Use simple, clear language
- Acknowledge the emotional difficulty of caregiving`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-10),
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", response.status, errText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly.", reply: "I'm receiving too many requests right now. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required.", reply: "The AI service needs additional credits. Please contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`OpenRouter responded with ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in dementia-assistant:", err);
    return new Response(JSON.stringify({ error: err.message, reply: "Sorry, something went wrong. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
