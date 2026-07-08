/**
 * NotchSidePeek — Notion-style side-peek overlay. Renders a page inside a
 * right-side sliding panel without leaving the current route. Supports up to
 * 3 stacked peeks — each new open pushes the previous ones down.
 * Trigger: window.dispatchEvent(new CustomEvent("nn:open-side-peek", { detail: { pageId: "..." } }))
 */
import { useEffect, useState } from "react";
import { X, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import NotchPage from "@/notch/pages/NotchPage";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const MAX_STACK = 3;

export function NotchSidePeek() {
  const [stack, setStack] = useState<string[]>([]);
  const nav = useNavigate();
  const path = useNotchPath();
  useEffect(() => {
    const onOpen = (e: any) => {
      const id = e?.detail?.pageId;
      if (!id) return;
      setStack((s) => (s[s.length - 1] === id ? s : [...s, id].slice(-MAX_STACK)));
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setStack((s) => s.slice(0, -1)); };
    window.addEventListener("nn:open-side-peek", onOpen as any);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("nn:open-side-peek", onOpen as any);
      window.removeEventListener("keydown", onEsc);
    };
  }, []);
  if (!stack.length) return null;
  return (
    <>
      <div
        onClick={() => setStack([])}
        style={{ position: "fixed", inset: 0, background: "rgba(15,15,15,0.35)", zIndex: 300 }}
      />
      {stack.map((pageId, idx) => {
        const offset = (stack.length - 1 - idx) * 32;
        const isTop = idx === stack.length - 1;
        return (
          <aside
            key={pageId + "_" + idx}
            style={{
              position: "fixed", top: offset, right: offset, bottom: 0,
              width: `min(${880 - offset}px, ${90 - offset / 10}vw)`, background: "var(--nn-bg)",
              zIndex: 301 + idx, boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
              display: "flex", flexDirection: "column",
              opacity: isTop ? 1 : 0.85,
              transition: "top 160ms ease, right 160ms ease, opacity 160ms ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderBottom: "1px solid var(--nn-border)", background: "var(--nn-bg)" }}>
              <button
                className="nn-topbar-btn"
                title="Open as full page"
                onClick={() => { setStack([]); nav(path(`/p/${pageId}`)); }}
              ><Maximize2 size={13} /></button>
              <div style={{ flex: 1, fontSize: 12, color: "var(--nn-text-tertiary)" }}>
                Side peek {stack.length > 1 ? `(${idx + 1}/${stack.length})` : ""}
              </div>
              <button className="nn-topbar-btn" title="Close this peek (Esc)" onClick={() => setStack((s) => s.filter((_, j) => j !== idx))}><X size={13} /></button>
            </div>
            <div style={{ flex: 1, overflow: "auto" }} key={pageId}>
              <SidePeekPage pageId={pageId} />
            </div>
          </aside>
        );
      })}
    </>
  );
}

function SidePeekPage({ pageId }: { pageId: string }) {
  return (
    <MemoryRouter initialEntries={[`/p/${pageId}`]}>
      <Routes>
        <Route path="/p/:pageId" element={<NotchPage />} />
      </Routes>
    </MemoryRouter>
  );
}
