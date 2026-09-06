---
name: AI conversation memory standard
description: Two-bucket rule for all AI features — casual chat is frontend-only with a 10k char rolling window; care-fact calls re-read DB and only persist conclusions.
type: feature
---

# AI conversation memory standard

## Two buckets

1. **Casual / companion chat** (e.g. 小忆 AI, safety assistant, info-sheet Q&A, dementia assistant)
   - Stored **only in the current page's React state**.
   - Rolling window capped at **10,000 characters** of combined user + assistant text.
   - When the limit is exceeded, drop the **oldest messages** first.
   - **No backend persistence**, no attachment to a cared-one record.
   - Shared-link / external visitors also store nothing.

2. **Care-fact / one-shot generation** (e.g. care tips, daily summary, insights, medication check, cognitive exercise, smart briefing)
   - AI does **not** trust its own memory.
   - Every call re-reads the latest facts from the database (medicines, check-ins, location, tasks, bookings, etc.).
   - Only the **formal conclusion/outcome** is written as a real record (e.g. a check-in log).
   - Chat transcript is **never** persisted.

## Implementation

- `src/lib/ai-memory.ts` exports `AI_MEMORY_CHAR_LIMIT = 10_000` and `trimMessagesToCharLimit(messages)`.
- `src/lib/ai-service.ts` defaults `persist` to `false`. Persistence into unified chat CCTs is opt-in via `persist: true` only when a feature explicitly needs a transcript.
- All current `invokeAI` and streaming call sites pass non-persisting histories capped by `trimMessagesToCharLimit`.

## Why no long-term AI summary file

- AI-generated summaries are not verified facts. Treating them as long-term memory risks "hallucinated history" becoming canonical.
- Medication, check-ins, location, symptoms, and chat conclusions must always come from the real database, not from an AI summary.

## Cost note

- Cheapest Lovable Gateway model at the time of this rule: `openai/gpt-5-nano` at roughly $0.05/M input tokens and $0.40/M output tokens.
- A 10,000-character English window is roughly 2,500 tokens — well under the cost of a single low-cost model call.
