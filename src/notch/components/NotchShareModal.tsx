import { useEffect, useMemo, useState } from "react";
import { X, Trash2, Link2, Copy, Globe, MessageSquare, Copy as CopyIcon, Search as SearchIcon, Calendar as CalIcon } from "lucide-react";
import { cctList, cctCreate, cctUpdate, cctDelete, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import { useNotchBase } from "@/notch/context/NotchBaseContext";

type Role = "viewer" | "commenter" | "editor" | "owner";
interface Perm { id: string; block_id?: string; email?: string; role?: Role; is_public?: number | string; }

type PublicSettings = {
  role: "viewer" | "commenter" | "editor";
  allowDuplicate: boolean;
  allowComments: boolean;
  searchIndex: boolean;
  expiresAt: string; // ISO or ""
};
const DEFAULT_PUB: PublicSettings = { role: "viewer", allowDuplicate: false, allowComments: true, searchIndex: false, expiresAt: "" };
const pubKey = (id: string) => `nn:pub:${id}`;

export function NotchShareModal({ blockId, onClose }: { blockId: string; onClose: () => void }) {
  const { user } = useNotchAuth();
  const base = useNotchBase();
  const [items, setItems] = useState<Perm[]>([]);
  const [publicRow, setPublicRow] = useState<Perm | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("viewer");
  const [busy, setBusy] = useState(false);
  const [members, setMembers] = useState<Array<{ id: string; email: string; display_name?: string }>>([]);
  const [pubSettings, setPubSettings] = useState<PublicSettings>(() => {
    try { return { ...DEFAULT_PUB, ...(JSON.parse(localStorage.getItem(pubKey(blockId)) || "{}")) }; }
    catch { return DEFAULT_PUB; }
  });
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"people" | "publish">("people");
  const [memberQuery, setMemberQuery] = useState("");

  const savePub = (next: Partial<PublicSettings>) => {
    const merged = { ...pubSettings, ...next };
    setPubSettings(merged);
    try { localStorage.setItem(pubKey(blockId), JSON.stringify(merged)); } catch {}
  };

  const load = async () => {
    const all = await cctList<any>(NN.permission);
    const mine = all.filter((p: any) => String(p.block_id) === String(blockId));
    setPublicRow(mine.find((p: any) => Number(p.is_public) === 1) || null);
    setItems(mine.filter((p: any) => Number(p.is_public) !== 1));
    try {
      const mrows = await cctList<any>(NN.member);
      setMembers(mrows.map((m: any) => ({ id: String(m.id), email: m.email || "", display_name: m.display_name })));
    } catch { setMembers([]); }
  };
  useEffect(() => { load(); }, [blockId]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const emailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const invite = async (targetEmail?: string, targetRole?: Role) => {
    const em = (targetEmail ?? email).trim();
    const r = targetRole ?? role;
    if (!em || !emailValid(em)) return;
    setBusy(true);
    try {
      await cctCreate(NN.permission, { block_id: String(blockId), email: em, role: r, is_public: 0, granted_by: user?.user_id || 0 });
      setEmail("");
      await load();
    } catch (e) { console.error(e); }
    setBusy(false);
  };
  const remove = async (id: string) => { await cctDelete(NN.permission, id); await load(); };
  const changeRole = async (id: string, r: Role) => { await cctUpdate(NN.permission, id, { role: r }); await load(); };

  const togglePublic = async () => {
    if (publicRow) { await cctDelete(NN.permission, publicRow.id); }
    else { await cctCreate(NN.permission, { block_id: String(blockId), email: "", role: pubSettings.role, is_public: 1, granted_by: user?.user_id || 0 }); }
    await load();
  };

  const isExpired = pubSettings.expiresAt && new Date(pubSettings.expiresAt).getTime() < Date.now();
  const publicUrl = `${window.location.origin}${base}/public/${blockId}${base ? "" : "?__site=notchnote"}`;
  const copyLink = async () => { try { await navigator.clipboard.writeText(publicUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} };

  const filteredMembers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase();
    const taken = new Set(items.map((p) => (p.email || "").toLowerCase()));
    return members
      .filter((m) => m.email && !taken.has(m.email.toLowerCase()))
      .filter((m) => !q || m.email.toLowerCase().includes(q) || (m.display_name || "").toLowerCase().includes(q))
      .slice(0, 6);
  }, [members, memberQuery, items]);

  const roleLabel: Record<Role, string> = { viewer: "Can view", commenter: "Can comment", editor: "Can edit", owner: "Full access" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "var(--nn-bg)", borderRadius: 8, width: "100%", maxWidth: 520, padding: 20 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Share</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-secondary)" }}><X size={16} /></button>
        </div>

        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--nn-border)", marginBottom: 12 }}>
          <button onClick={() => setTab("people")} className="nn-topbar-btn" style={{ borderBottom: tab === "people" ? "2px solid var(--nn-text)" : "none", borderRadius: 0 }}>Share</button>
          <button onClick={() => setTab("publish")} className="nn-topbar-btn" style={{ borderBottom: tab === "publish" ? "2px solid var(--nn-text)" : "none", borderRadius: 0 }}>Publish</button>
        </div>

        {tab === "people" && (
          <>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, position: "relative" }}>
              <input
                value={email}
                onChange={(e) => { setEmail(e.target.value); setMemberQuery(e.target.value); }}
                placeholder="Add people, emails, or workspace members"
                className="nn-auth-input"
                style={{ marginBottom: 0, flex: 1 }}
              />
              <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="nn-auth-input" style={{ marginBottom: 0, width: 130 }}>
                <option value="viewer">Can view</option>
                <option value="commenter">Can comment</option>
                <option value="editor">Can edit</option>
                <option value="owner">Full access</option>
              </select>
              <button onClick={() => invite()} disabled={busy || !emailValid(email)} className="nn-btn-primary">Invite</button>
              {email && !emailValid(email) && (
                <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, fontSize: 11, color: "var(--nn-danger, #e03e3e)" }}>Enter a valid email address.</div>
              )}
              {email && emailValid(email) && filteredMembers.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 140, background: "var(--nn-bg)", border: "1px solid var(--nn-border)", borderRadius: 6, marginTop: 4, boxShadow: "var(--nn-shadow-md)", zIndex: 10, maxHeight: 200, overflow: "auto" }}>
                  {filteredMembers.map((m) => (
                    <div key={m.id} onClick={() => { setEmail(""); setMemberQuery(""); invite(m.email, role); }} style={{ padding: "6px 10px", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }} onMouseDown={(e) => e.preventDefault()}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--nn-bg-tertiary)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>
                        {(m.display_name || m.email).slice(0, 1).toUpperCase()}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.display_name || m.email}</div>
                        {m.display_name && <div style={{ fontSize: 11, color: "var(--nn-text-tertiary)" }}>{m.email}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px solid var(--nn-border)", paddingTop: 12, marginTop: 8 }}>
              <div style={{ fontSize: 13, color: "var(--nn-text-secondary)", marginBottom: 8 }}>People with access</div>
              {items.map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--nn-bg-tertiary)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>
                    {(p.email || "?").slice(0, 1).toUpperCase()}
                  </span>
                  <div style={{ flex: 1, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.email}</div>
                  <select value={p.role || "viewer"} onChange={(e) => changeRole(p.id, e.target.value as Role)} className="nn-auth-input" style={{ marginBottom: 0, width: 130 }}>
                    <option value="viewer">{roleLabel.viewer}</option>
                    <option value="commenter">{roleLabel.commenter}</option>
                    <option value="editor">{roleLabel.editor}</option>
                    <option value="owner">{roleLabel.owner}</option>
                  </select>
                  <button onClick={() => remove(p.id)} title="Remove" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-tertiary)" }}><Trash2 size={14} /></button>
                </div>
              ))}
              {!items.length && <div style={{ fontSize: 13, color: "var(--nn-text-tertiary)" }}>Only you have access.</div>}
            </div>
          </>
        )}

        {tab === "publish" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--nn-bg-secondary)", borderRadius: 6, marginBottom: 12 }}>
              <Globe size={18} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Publish to web</div>
                <div style={{ fontSize: 12, color: "var(--nn-text-tertiary)" }}>{publicRow ? (isExpired ? "Link has expired." : "Anyone with the link can view.") : "Publish this page to the internet."}</div>
              </div>
              <Switch checked={!!publicRow} onChange={togglePublic} />
            </div>

            {publicRow && (
              <>
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  <input readOnly value={publicUrl} disabled={!!isExpired} className="nn-auth-input" style={{ marginBottom: 0, flex: 1, fontSize: 12, opacity: isExpired ? 0.55 : 1 }} onFocus={(e) => e.currentTarget.select()} />
                  <button onClick={copyLink} disabled={!!isExpired} className="nn-topbar-btn" style={{ opacity: isExpired ? 0.55 : 1, cursor: isExpired ? "not-allowed" : "pointer" }}><CopyIcon size={13} style={{ marginRight: 4 }} />{copied ? "Copied" : "Copy"}</button>
                </div>
                {isExpired && (
                  <div style={{ fontSize: 12, color: "var(--nn-danger, #e03e3e)", marginBottom: 10 }}>This link has expired. Clear or update the expiration below to re-enable it.</div>
                )}

                <div style={{ borderTop: "1px solid var(--nn-border)", paddingTop: 12 }}>
                  <div style={{ fontSize: 12, color: "var(--nn-text-secondary)", marginBottom: 6 }}>Link options</div>

                  <SettingRow icon={<MessageSquare size={14} />} label="Allow comments" hint="Visitors can leave comments on this page.">
                    <input type="checkbox" checked={pubSettings.allowComments} onChange={(e) => savePub({ allowComments: e.target.checked })} />
                  </SettingRow>
                  <SettingRow icon={<CopyIcon size={14} />} label="Allow duplicate as template" hint="Visitors can copy this page into their workspace.">
                    <input type="checkbox" checked={pubSettings.allowDuplicate} onChange={(e) => savePub({ allowDuplicate: e.target.checked })} />
                  </SettingRow>
                  <SettingRow icon={<SearchIcon size={14} />} label="Search engine indexing" hint="Allow Google and others to index this page.">
                    <input type="checkbox" checked={pubSettings.searchIndex} onChange={(e) => savePub({ searchIndex: e.target.checked })} />
                  </SettingRow>
                  <SettingRow icon={<CalIcon size={14} />} label="Link expiration" hint={pubSettings.expiresAt ? `Expires ${new Date(pubSettings.expiresAt).toLocaleString()}` : "Never"}>
                    <input
                      type="datetime-local"
                      value={pubSettings.expiresAt ? pubSettings.expiresAt.slice(0, 16) : ""}
                      onChange={(e) => savePub({ expiresAt: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                      className="nn-auth-input"
                      style={{ marginBottom: 0, fontSize: 12, padding: "3px 6px" }}
                    />
                  </SettingRow>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 13 }}>
                    <Link2 size={14} />
                    <span style={{ flex: 1 }}>Public role</span>
                    <select
                      value={pubSettings.role}
                      onChange={(e) => { const r = e.target.value as PublicSettings["role"]; savePub({ role: r }); if (publicRow) cctUpdate(NN.permission, publicRow.id, { role: r }).then(load); }}
                      className="nn-auth-input"
                      style={{ marginBottom: 0, width: 130 }}
                    >
                      <option value="viewer">Can view</option>
                      <option value="commenter">Can comment</option>
                      <option value="editor">Can edit</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingRow({ icon, label, hint, children }: { icon: React.ReactNode; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--nn-border)" }}>
      <span style={{ color: "var(--nn-text-secondary)" }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: "var(--nn-text-tertiary)" }}>{hint}</div>}
      </div>
      {children}
    </div>
  );
}
