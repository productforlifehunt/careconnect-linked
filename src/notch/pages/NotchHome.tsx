import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { cctList, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import { FileText } from "lucide-react";

export default function NotchHome() {
  const { user } = useNotchAuth();
  const nav = useNavigate();
  const path = useNotchPath();
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const blocks = await cctList<any>(NN.block);
      const mine = blocks
        .filter((b: any) => (b.type === "page" || b.type === "database") && Number(b.archived) !== 1)
        .sort((a: any, b: any) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())
        .slice(0, 12);
      setRecent(mine);
    })();
  }, []);

  return (
    <div className="nn-page-scroll">
      <div className="nn-page">
        <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
          {(() => {
            const h = new Date().getHours();
            const g = h < 5 ? "Good night" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
            return `${g}, ${user?.user_display_name?.split(" ")[0] || "there"}`;
          })()}
        </div>
        <div style={{ color: "var(--nn-text-secondary)", marginBottom: 32 }}>
          Pick up where you left off, or create a new page from the sidebar.
        </div>
        <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "var(--nn-text-tertiary)", marginBottom: 12 }}>
          Recently visited
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {recent.map((p) => (
            <div
              key={p.id}
              onClick={() => nav(path(`/p/${p.id}`))}
              style={{ border: "1px solid var(--nn-border)", borderRadius: 6, padding: 16, cursor: "pointer", background: "var(--nn-bg)", minHeight: 100 }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{p.icon || <FileText size={20} />}</div>
              <div style={{ fontWeight: 500, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.title || "Untitled"}
              </div>
              <div style={{ fontSize: 12, color: "var(--nn-text-tertiary)" }}>
                {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : ""}
              </div>
            </div>
          ))}
          {!recent.length && (
            <div style={{ color: "var(--nn-text-tertiary)", gridColumn: "1 / -1" }}>
              No pages yet. Create your first one from the sidebar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
