/**
 * Quote Protocol — embed structured quote data inside a chat message's
 * content field using a fenced marker. This avoids needing a new WP CCT
 * field; any chat client that doesn't understand the marker just shows
 * the plain-text fallback.
 *
 * Format inside message content:
 *   [QUOTE]{"mode":"flat","amount":200,...}[/QUOTE]\n<plain summary>
 */

export type QuoteMode = "hourly" | "flat";
export type QuoteStatus = "pending" | "accepted" | "declined" | "paid" | "cancelled";

export interface QuoteData {
  mode: QuoteMode;
  amount: number;             // total price (USD)
  ratePerHour?: number;       // hourly mode only
  hours?: number;             // hourly mode only
  serviceType?: string;       // optional label
  delivery?: "local" | "virtual";
  note?: string;
  jobId?: string | number;    // optional related job
  status: QuoteStatus;
  vendorUserId?: string | number; // who will receive the money (the seller)
  wcProductId?: number;       // populated after accept
  wcOrderId?: number;         // populated after payment
  createdAt?: string;
}

const OPEN = "[QUOTE]";
const CLOSE = "[/QUOTE]";

export function encodeQuote(q: QuoteData): string {
  const json = JSON.stringify(q);
  const summary =
    q.mode === "hourly"
      ? `💬 Quote: $${q.ratePerHour}/hr × ${q.hours}h = $${q.amount}${q.serviceType ? ` for ${q.serviceType}` : ""}`
      : `💬 Quote: $${q.amount} flat${q.serviceType ? ` for ${q.serviceType}` : ""}${q.note ? ` — ${q.note}` : ""}`;
  return `${OPEN}${json}${CLOSE}\n${summary}`;
}

export function extractQuote(content: string | null | undefined): QuoteData | null {
  if (!content) return null;
  const start = content.indexOf(OPEN);
  if (start < 0) return null;
  const end = content.indexOf(CLOSE, start + OPEN.length);
  if (end < 0) return null;
  const raw = content.slice(start + OPEN.length, end);
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "amount" in parsed && "mode" in parsed) {
      return parsed as QuoteData;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Strip the marker from a content string, leaving only the human-readable summary. */
export function stripQuoteMarker(content: string): string {
  const start = content.indexOf(OPEN);
  if (start < 0) return content;
  const end = content.indexOf(CLOSE, start + OPEN.length);
  if (end < 0) return content;
  return (content.slice(0, start) + content.slice(end + CLOSE.length)).trim();
}
