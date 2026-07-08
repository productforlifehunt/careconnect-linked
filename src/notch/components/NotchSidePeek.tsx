/**
 * NotchSidePeek — Notion-style side-peek overlay. Renders a page inside a
 * right-side sliding panel without leaving the current route.
 * Trigger: window.dispatchEvent(new CustomEvent("nn:open-side-peek", { detail: { pageId: "..." } }))
 */
import { useEffect, useState } from "react";
import { X, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import NotchPage from "@/notch/pages/NotchPage";

export function NotchSidePeek() {
  const [pageId, setPageId] = useState<string | null>(null);
  const nav = useNavigate();
  const path = useNotchPath();
  useEffect(() => {
    const onOpen = (e: any) => setPageId(e?.detail?.pageId || null);
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setPageId(null); };
    window.addEventListener("nn:open-side-peek", onOpen as any);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("nn:open-side-peek", onOpen as any);
      window.removeEventListener("keydown", onEsc);
    };
  }, []);
  if (!pageId) return null;
  return (
    <>
      <div
        onClick={() => setPageId(null)}
        style={{ position: "fixed", inset: 0, background: "rgba(15,15,15,0.35)", zIndex: 300 }}
      />
      <aside
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "min(880px, 90vw)", background: "var(--nn-bg)",
          zIndex: 301, boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderBottom: "1px solid var(--nn-border)", background: "var(--nn-bg)" }}>
          <button
            className="nn-topbar-btn"
            title="Open as full page"
            onClick={() => { const id = pageId; setPageId(null); nav(path(`/p/${id}`)); }}
          ><Maximize2 size={13} /></button>
          <div style={{ flex: 1, fontSize: 12, color: "var(--nn-text-tertiary)" }}>Side peek</div>
          <button className="nn-topbar-btn" title="Close (Esc)" onClick={() => setPageId(null)}><X size={13} /></button>
        </div>
        <div style={{ flex: 1, overflow: "auto" }} key={pageId}>
          <SidePeekPage pageId={pageId} />
        </div>
      </aside>
    </>
  );
}

// Render NotchPage bound to a fixed pageId (bypass URL params). We do this by
// mounting inside a wrapper that overrides the URL via `history.replaceState`
// is intrusive; simplest: dispatch a route-less mount by using a memory route.
// To avoid coupling, we lazily render NotchPage inside a MemoryRouter-lite:
// just pushState + pop back on unmount would trigger the real route. Instead
// we import NotchPage and wrap it in a router-scoped element that reads pageId
// from a prop via useParams monkey-patch — cleanest: use a small
// <MemoryRouter> wrapper.
import { MemoryRouter, Routes, Route } from "react-router-dom";
function SidePeekPage({ pageId }: { pageId: string }) {
  return (
    <MemoryRouter initialEntries={[`/p/${pageId}`]}>
      <Routes>
        <Route path="/p/:pageId" element={<NotchPage />} />
      </Routes>
    </MemoryRouter>
  );
}
