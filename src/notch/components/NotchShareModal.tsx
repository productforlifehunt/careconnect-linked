import { useEffect, useState } from "react";
import { X, Trash2, Link2, Copy } from "lucide-react";
import { cctList, cctCreate, cctUpdate, cctDelete, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";

type Role = "viewer" | "editor" | "owner";
interface Perm { id: string; block_id?: string; email?: string; role?: Role; is_public?: number | string; }

export function NotchShareModal({ blockId, onClose }: { blockId: string; onClose: () => void }) {
  const { user } = useNotchAuth();
  const [items, setItems] = useState<Perm[]>([]);
  const [publicRow, setPublicRow] = useState<Perm | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("viewer");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const all = await cctList<any>(NN.permission);
    const mine = all.filter((p: any) => String(p.block_id) === String(blockId));
    setPublicRow(mine.find((p: any) => Number(p.is_public) === 1) || null);
    setItems(mine.filter((p: any) => Number(p.is_public) !== 1));
  };
  useEffect(() => { load(); }, [blockId]);

  const invite = async () => {
    const em = email.trim();
    if (!em) return;
    setBusy(true);
    try {
      await cctCreate(NN.permission, { block_id: String(blockId), email: em, role, is_public: 0, granted_by: user?.user_id || 0 });
      setEmail("");
      await load();
    } catch (e) { console.error(e); }
    setBusy(false);
  };
  const remove = async (id: string) => { await cctDelete(NN.permission, id); await load(); };
  const changeRole = async (id: string, r: Role) => { await cctUpdate(NN.permission, id, { role: r }); await load(); };

  const togglePublic = async () => {
    if (publicRow) { await cctDelete(NN.permission, publicRow.id); }
    else { await cctCreate(NN.permission, { block_id: String(blockId), email: "", role: "viewer", is_public: 1, granted_by: user?.user_id || 0 }); }
    await load();
  };

  const publicUrl = `${window.location.origin}/notch/p/${blockId}`;
  const copyLink = async () => { try { await navigator.clipboard.writeText(publicUrl); } catch {} };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "var(--nn-bg)", borderRadius: 8, width: "100%", maxWidth: 480, padding: 20 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Share this page</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-secondary)" }}><X size={16} /></button>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="nn-auth-input" style={{ marginBottom: 0, flex: 1 }} />
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="nn-auth-input" style={{ marginBottom: 0, width: 110 }}>
            <option value="viewer">Can view</option>
            <option value="editor">Can edit</option>
            <option value="owner">Full access</option>
          </select>
          <button onClick={invite} disabled={busy} className="nn-btn-primary">Invite</button>
        </div>

        <div style={{ borderTop: "1px solid var(--nn-border)", paddingTop: 12, marginTop: 12 }}>
          <div style={{ fontSize: 13, color: "var(--nn-text-secondary)", marginBottom: 8 }}>People with access</div>
          {items.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
              <div style={{ flex: 1, fontSize: 14 }}>{p.email}</div>
              <select value={p.role || "viewer"} onChange={(e) => changeRole(p.id, e.target.value as Role)} className="nn-auth-input" style={{ marginBottom: 0, width: 110 }}>
                <option value="viewer">Can view</option>
                <option value="editor">Can edit</option>
                <option value="owner">Full access</option>
              </select>
              <button onClick={() => remove(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-tertiary)" }}><Trash2 size={14} /></button>
            </div>
          ))}
          {!items.length && <div style={{ fontSize: 13, color: "var(--nn-text-tertiary)" }}>Only you have access.</div>}
        </div>

        <div style={{ borderTop: "1px solid var(--nn-border)", paddingTop: 12, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link2 size={16} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Share to web</div>
              <div style={{ fontSize: 12, color: "var(--nn-text-tertiary)" }}>{publicRow ? "Anyone with the link can view." : "Publish this page to the internet."}</div>
            </div>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input type="checkbox" checked={!!publicRow} onChange={togglePublic} />
            </label>
          </div>
          {publicRow && (
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <input readOnly value={publicUrl} className="nn-auth-input" style={{ marginBottom: 0, flex: 1, fontSize: 12 }} />
              <button onClick={copyLink} className="nn-topbar-btn"><Copy size={13} /> Copy</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
