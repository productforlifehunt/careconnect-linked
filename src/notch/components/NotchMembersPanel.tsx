import { useEffect, useState, useCallback } from "react";
import { nnConfirm } from "@/notch/lib/nn-dialog";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import {
  listMembers, listInvites, createInvite, revokeInvite, removeMember, updateMemberRole,
  buildInviteUrl, type WorkspaceMember, type Invite, type MemberRole,
} from "@/notch/lib/nn-collab";
import { cctList, NN } from "@/notch/lib/nn-client";
import { Copy, X, Users } from "lucide-react";

interface Workspace { id: string; name: string; icon?: string }

export function NotchMembersPanel() {
  const { user } = useNotchAuth();
  const [wsList, setWsList] = useState<Workspace[]>([]);
  const [wsId, setWsId] = useState<string>("");
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("member");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const all = await cctList<Workspace>(NN.workspace);
      const mine = all.filter((w: any) => !user || String(w.author_id) === String(user.user_id));
      const list = mine.length ? mine : all;
      setWsList(list);
      if (list[0]?.id) setWsId(list[0].id);
    })();
  }, [user]);

  const load = useCallback(async () => {
    if (!wsId) return;
    setLoading(true);
    try {
      const [m, i] = await Promise.all([listMembers(wsId), listInvites(wsId)]);
      setMembers(m);
      setInvites(i.filter((x) => x.status === "pending"));
    } finally {
      setLoading(false);
    }
  }, [wsId]);

  useEffect(() => { load(); }, [load]);

  const invite = async () => {
    if (!user || !wsId || !email.trim()) return;
    setBusy(true);
    try {
      const inv = await createInvite(wsId, email.trim(), role, String(user.user_id));
      setEmail("");
      setMsg(`Invite link: ${buildInviteUrl(inv.token)}`);
      load();
    } catch (e: any) {
      setMsg(`Failed: ${e.message || e}`);
    } finally {
      setBusy(false);
    }
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(buildInviteUrl(token));
    setMsg("Invite link copied");
  };

  return (
    <div style={{ border: "1px solid var(--nn-border)", borderRadius: 6, padding: 16, marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: "var(--nn-text-tertiary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <Users size={12} /> Members & Invites
      </div>

      {wsList.length > 1 && (
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 12, marginRight: 6 }}>Workspace:</label>
          <select value={wsId} onChange={(e) => setWsId(e.target.value)} style={{ padding: "4px 8px", border: "1px solid var(--nn-border)", borderRadius: 4, background: "var(--nn-bg)", color: "inherit" }}>
            {wsList.map((w) => <option key={w.id} value={w.id}>{w.icon || "📓"} {w.name}</option>)}
          </select>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <input
          type="email"
          placeholder="Invite by email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ flex: 1, padding: "6px 10px", border: "1px solid var(--nn-border)", borderRadius: 4, background: "var(--nn-bg)", color: "inherit" }}
        />
        <select value={role} onChange={(e) => setRole(e.target.value as MemberRole)} style={{ padding: "6px 8px", border: "1px solid var(--nn-border)", borderRadius: 4, background: "var(--nn-bg)", color: "inherit" }}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
          <option value="guest">Guest</option>
        </select>
        <button className="nn-btn-primary" disabled={busy || !email} onClick={invite}>Invite</button>
      </div>

      {msg && <div style={{ fontSize: 12, background: "rgba(35,131,226,0.08)", padding: 8, borderRadius: 4, marginBottom: 10, wordBreak: "break-all" }}>{msg}</div>}

      <div style={{ fontSize: 12, color: "var(--nn-text-tertiary)", marginTop: 8, marginBottom: 4 }}>Members ({members.length})</div>
      {loading ? <div style={{ fontSize: 12, opacity: 0.6 }}>Loading…</div> : members.length === 0 ? (
        <div style={{ fontSize: 12, opacity: 0.6 }}>No members yet.</div>
      ) : (
        members.map((m) => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--nn-border)" }}>
            <div style={{ flex: 1, fontSize: 13 }}>User {m.user_id}</div>
            <select value={m.role} onChange={async (e) => { await updateMemberRole(m.id, e.target.value as MemberRole); load(); }} style={{ padding: "2px 6px", fontSize: 12, border: "1px solid var(--nn-border)", borderRadius: 4, background: "var(--nn-bg)", color: "inherit" }} disabled={m.role === "owner"}>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="guest">Guest</option>
            </select>
            {m.role !== "owner" && <button className="nn-topbar-btn" onClick={async () => { if (await nnConfirm("Remove this member from the workspace?", "Remove member")) { await removeMember(m.id); load(); } }}><X size={12} /></button>}
          </div>
        ))
      )}

      {invites.length > 0 && (
        <>
          <div style={{ fontSize: 12, color: "var(--nn-text-tertiary)", marginTop: 12, marginBottom: 4 }}>Pending invites ({invites.length})</div>
          {invites.map((i) => (
            <div key={i.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--nn-border)" }}>
              <div style={{ flex: 1, fontSize: 13 }}>{i.email} <span style={{ opacity: 0.6, fontSize: 11 }}>({i.role})</span></div>
              <button className="nn-topbar-btn" onClick={() => copyLink(i.token)} title="Copy invite link"><Copy size={12} /></button>
              <button className="nn-topbar-btn" onClick={async () => { await revokeInvite(i.id); load(); }} title="Revoke"><X size={12} /></button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
