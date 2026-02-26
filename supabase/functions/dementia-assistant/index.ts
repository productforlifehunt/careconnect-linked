import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { messages } = await req.json();

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-10), // Keep last 10 messages for context
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI Gateway error:", errText);
      throw new Error(`AI Gateway responded with ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ reply }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Error in dementia-assistant:", err);
    return new Response(JSON.stringify({ error: err.message, reply: "Sorry, something went wrong. Please try again." }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
