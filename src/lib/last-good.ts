/**
 * Last-good snapshot cache (stale-while-revalidate).
 *
 * Some lists must cross a slow hop before they can render — the booking list,
 * for example, has to be read with the store's own credentials on the server.
 * Instead of showing an empty card until that round-trip finishes, we keep the
 * previous successful result in localStorage and show it immediately, then
 * replace it as soon as fresh data lands. The user sees content instantly and
 * never a spinner on a screen they have already visited.
 */

const PREFIX = "cc_lastgood_";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function readLastGood<T>(key: string): T | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { at: number; data: T };
    if (!parsed || typeof parsed.at !== "number") return undefined;
    if (Date.now() - parsed.at > MAX_AGE_MS) return undefined;
    return parsed.data;
  } catch {
    return undefined;
  }
}

export function writeLastGood<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* storage full or blocked — the cache is optional */
  }
}

/** Wrap a fetcher so every successful result is remembered for next time. */
export function withLastGood<T>(key: string, fetcher: () => Promise<T>): () => Promise<T> {
  return async () => {
    const data = await fetcher();
    writeLastGood(key, data);
    return data;
  };
}
