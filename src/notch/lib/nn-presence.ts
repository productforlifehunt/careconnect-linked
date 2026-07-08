/**
 * Lightweight presence + cursor sync via BroadcastChannel (same browser, cross-tab)
 * with graceful fallback to no-op. Not a real Yjs — no cross-machine sync —
 * but demonstrates live cursors and viewer list for local multi-tab collab.
 */

export interface Peer {
  id: string;
  name: string;
  color: string;
  x?: number;   // caret position (viewport px)
  y?: number;
  ts: number;
}

const COLORS = ["#e94560", "#2383e2", "#0f9d58", "#f4b400", "#a259ff", "#ff7a59", "#00b8d9"];
function colorFor(id: string) { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0; return COLORS[h % COLORS.length]; }

class Presence {
  ch: BroadcastChannel | null = null;
  peers = new Map<string, Peer>();
  me: Peer;
  listeners = new Set<() => void>();
  hb: any = null;

  constructor(private topic: string, myId: string, myName: string) {
    this.me = { id: myId, name: myName, color: colorFor(myId), ts: Date.now() };
    try { this.ch = new BroadcastChannel(`nn:presence:${topic}`); } catch { this.ch = null; }
    if (this.ch) {
      this.ch.onmessage = (e) => {
        const msg = e.data as any;
        if (!msg || msg.from === this.me.id) return;
        if (msg.type === "hello" || msg.type === "cursor") {
          this.peers.set(msg.from, { id: msg.from, name: msg.name, color: msg.color, x: msg.x, y: msg.y, ts: Date.now() });
          this.emit();
        } else if (msg.type === "bye") {
          this.peers.delete(msg.from);
          this.emit();
        }
      };
      this.post({ type: "hello", from: this.me.id, name: this.me.name, color: this.me.color });
      this.hb = setInterval(() => {
        this.post({ type: "hello", from: this.me.id, name: this.me.name, color: this.me.color });
        // GC stale peers > 15s
        const cutoff = Date.now() - 15000;
        for (const [k, v] of this.peers) if (v.ts < cutoff) this.peers.delete(k);
        this.emit();
      }, 5000);
      window.addEventListener("beforeunload", () => this.post({ type: "bye", from: this.me.id }));
    }
  }

  post(m: any) { try { this.ch?.postMessage(m); } catch {} }
  cursor(x: number, y: number) {
    this.me.x = x; this.me.y = y;
    this.post({ type: "cursor", from: this.me.id, name: this.me.name, color: this.me.color, x, y });
  }
  onChange(fn: () => void) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit() { this.listeners.forEach((fn) => { try { fn(); } catch {} }); }
  destroy() { if (this.hb) clearInterval(this.hb); this.post({ type: "bye", from: this.me.id }); try { this.ch?.close(); } catch {} }
}

let current: { key: string; p: Presence } | null = null;

export function joinPresence(topic: string, myId: string, myName: string): Presence {
  const key = `${topic}::${myId}`;
  if (current && current.key === key) return current.p;
  if (current) current.p.destroy();
  const p = new Presence(topic, myId, myName);
  current = { key, p };
  return p;
}
