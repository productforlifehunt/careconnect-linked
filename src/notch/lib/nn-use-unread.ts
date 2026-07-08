/**
 * Notch Note — shared unread-count hook.
 * Polls every 60s, refreshes on window focus, and syncs across tabs via
 * BroadcastChannel("nn-notifications"). Emit "changed" from any component
 * that mutates notification read state to broadcast an immediate refresh.
 */
import { useEffect, useRef, useState } from "react";
import { unreadCount, tickReminderQueue } from "./nn-notifications";

const CHANNEL = "nn-notifications";

export function emitUnreadChanged() {
  try {
    const bc = new BroadcastChannel(CHANNEL);
    bc.postMessage({ t: "changed" });
    bc.close();
  } catch { /* noop */ }
  try { window.dispatchEvent(new Event("nn:unread-changed")); } catch { /* noop */ }
}

export function useUnreadCount(userId: string | number | null | undefined): number {
  const [n, setN] = useState(0);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    if (!userId) { setN(0); return; }
    const uid = String(userId);

    const load = async () => {
      try {
        await tickReminderQueue(uid);
        const c = await unreadCount(uid);
        if (alive.current) setN(c);
      } catch { /* noop */ }
    };

    load();
    const t = setInterval(load, 60_000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    window.addEventListener("nn:unread-changed", onFocus);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(CHANNEL);
      bc.onmessage = () => load();
    } catch { /* noop */ }

    return () => {
      alive.current = false;
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("nn:unread-changed", onFocus);
      try { bc?.close(); } catch { /* noop */ }
    };
  }, [userId]);

  return n;
}
