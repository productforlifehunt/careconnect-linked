import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(`${process.cwd()}/${path}`, "utf8");

describe("actual research model request settings", () => {
  it("uses Gemini 3.8 Flash for joint audio transcription and translation without explicit reasoning controls", () => {
    const code = source("supabase/functions/interview-transcribe/index.ts");
    expect(code.match(/const MODEL = "([^"]+)"/)?.[1]).toBe("google/gemini-3.8-flash");
    expect(code).toMatch(/model: MODEL/);
    expect(code).not.toMatch(/reasoning_effort\s*:|thinking_budget\s*:|thinkingBudget\s*:/);
  });

  it("uses Gemini 3.8 Flash for anonymization without explicit reasoning controls", () => {
    const code = source("supabase/functions/interview-audio/index.ts").split('body.action === "anonymize"')[1];
    expect(code?.match(/model: "([^"]+)"/)?.[1]).toBe("google/gemini-3.8-flash");
    expect(code).not.toMatch(/reasoning_effort\s*:|thinking_budget\s*:|thinkingBudget\s*:/);
  });

  it("uses GPT-5 nano with explicit reasoning effort none for diary translation", () => {
    const code = source("supabase/functions/ai/index.ts").split("async function handleTranslate")[1]?.split("function parseTasks")[0];
    expect(code?.match(/model: "([^"]+)"/)?.[1]).toBe("openai/gpt-5-nano");
    expect(code?.match(/reasoning_effort: "([^"]+)"/)?.[1]).toBe("none");
  });
});