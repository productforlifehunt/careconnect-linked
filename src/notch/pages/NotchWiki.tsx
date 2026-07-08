/**
 * NotchWiki — Notion-style Wiki view. Lists every page in the workspace that
 * has been marked verified, grouped by owner. Expired verifications show as
 * amber so owners know to re-verify.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import { cctList, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import { useNotchPath } from "@/notch/context/NotchBaseContext";

type Entry = {
  id: string;
  title: string;
  icon: string;
  by: string;
  at: number;
  expires: number;
  expired: boolean;
};

export default function NotchWiki() {
  const { user } = useNotchAuth();
  const path = useNotchPath();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const wsAll = await cctList<any>(NN.member, { user_id: (user as any)?.user_id }).catch(() => []);
        const wsIds: string[] = Array.from(new Set(wsAll.map((m: any) => String(m.workspace_id)).filter(Boolean)));
        const now = Date.now();
        const collected: Entry[] = [];
        for (const wid of wsIds.length ? wsIds : [""]) {
          const all = await cctList<any>(NN.block, wid ? { workspace_id: wid } : undefined).catch(() => []);
          for (const b of all) {
            if (Number(b.archived) === 1) continue;
            if (b.type !== "page" && b.type !== "database") continue;
            let props: any = {};
            try { props = b.properties ? JSON.parse(b.properties) : {}; } catch {}
            if (!props.verified) continue;
            const m = props.verified_meta || {};
            collected.push({
              id: String(b.id), title: b.title || "Untitled", icon: b.icon || "📄",
              by: m.by || "—", at: Number(m.at) || 0, expires: Number(m.expires) || 0,
              expired: m.expires ? now > m.expires : false,
            });
          }
        }
        collected.sort((a, b) => b.at - a.at);
        setEntries(collected);
      } finally { setLoading(false); }
    })();
  }, [user]);

  const byOwner = entries.reduce<Record<string, Entry[]>>((acc, e) => { (acc[e.by] ||= []).push(e); return acc; }, {});
  const owners = Object.keys(byOwner).sort();

  return (
    <div className="nn-page-scroll">
      <div className="nn-page" style={{ maxWidth: 960 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <BadgeCheck size={22} color="#448361" />
          <div style={{ fontSize: 28, fontWeight: 700 }}>Wiki</div>
        </div>
        <div style={{ fontSize: 13, color: "var(--nn-text-secondary)", marginBottom: 20 }}>
          Every verified page across your workspaces. Owners are responsible for keeping content accurate — expired items are highlighted.
        </div>
        {loading ? <div style={{ color: "var(--nn-text-tertiary)" }}>Loading…</div>
          : entries.length === 0 ? (
            <div style={{ padding: 40, border: "1px dashed var(--nn-border)", borderRadius: 8, textAlign: "center", color: "var(--nn-text-tertiary)" }}>
              No verified pages yet. Open any page and choose "Mark as verified (wiki)" from the ⋯ menu.
            </div>
          ) : (
            owners.map((o) => (
              <div key={o} style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--nn-text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                  Owned by {o} · {byOwner[o].length}
                </div>
                {byOwner[o].map((e) => (
                  <Link key={e.id} to={path(`/p/${e.id}`)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid var(--nn-border)", borderRadius: 6, marginBottom: 6, textDecoration: "none", color: "var(--nn-text)", background: "var(--nn-bg)" }}>
                    <span style={{ fontSize: 18 }}>{e.icon}</span>
                    <span style={{ flex: 1, fontSize: 14 }}>{e.title}</span>
                    <span style={{ fontSize: 12, color: e.expired ? "#cb912f" : "#448361", background: e.expired ? "rgba(203,145,47,0.14)" : "rgba(68,131,97,0.14)", padding: "2px 8px", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <BadgeCheck size={12} /> {e.expired ? "Expired" : "Verified"}
                    </span>
                    {e.at ? <span style={{ fontSize: 11, color: "var(--nn-text-tertiary)" }}>{new Date(e.at).toLocaleDateString()}</span> : null}
                  </Link>
                ))}
              </div>
            ))
          )}
      </div>
    </div>
  );
}
