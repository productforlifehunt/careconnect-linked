export interface SharedNote { t: string; c: string; s?: string; p?: string }

const toB64Url = (s: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export function encodeSharedNote(n: SharedNote): string {
  return `${window.location.origin}/share/note?d=${toB64Url(JSON.stringify(n))}`;
}

export function decodeSharedNote(d: string): SharedNote | null {
  try {
    const b = atob(d.replace(/-/g, "+").replace(/_/g, "/"));
    const obj = JSON.parse(new TextDecoder().decode(Uint8Array.from(b, (ch) => ch.charCodeAt(0))));
    return obj && typeof obj.t === "string" && typeof obj.c === "string" ? obj : null;
  } catch {
    return null;
  }
}
