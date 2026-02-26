/**
 * AI Service — Calls the ai-care-engine edge function on Lovable Cloud.
 * This is the ONLY place that edge functions on Lovable Cloud are invoked.
 * All data operations still use careDb/careAuth from external-client.ts.
 */
import { supabase } from "@/integrations/supabase/client";

export type AIMode =
  | "insights"
  | "cognitive_exercise"
  | "medication_check"
  | "behavior_analysis"
  | "care_tips"
  | "daily_summary"
  | "routine_suggestion";

export async function invokeAI(mode: AIMode, context: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("ai-care-engine", {
    body: { mode, context },
  });
  if (error) throw error;
  return data?.reply as string;
}

/** Parse JSON from AI reply, stripping markdown fences if present */
export function parseAIJson<T = any>(reply: string): T | null {
  try {
    let cleaned = reply.trim();
    // Strip markdown code fences
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    return JSON.parse(cleaned);
  } catch {
    console.warn("Failed to parse AI JSON:", reply.slice(0, 200));
    return null;
  }
}
