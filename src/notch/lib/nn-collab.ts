/**
 * Notch Note — Workspace collaboration (members + invites).
 * Backed by nn_workspace_member and nn_invite CCTs.
 */
import { cctList, cctCreate, cctUpdate, cctDelete, NN } from "./nn-client";

export type MemberRole = "owner" | "admin" | "member" | "guest";
export type InviteStatus = "pending" | "accepted" | "declined" | "expired";

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: MemberRole;
  status: string;
  invited_by?: string;
  joined_at?: string;
}

export interface Invite {
  id: string;
  workspace_id: string;
  email: string;
  token: string;
  invited_by: string;
  role: MemberRole;
  expires_at: string;
  status: InviteStatus;
}

const rand = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

export async function listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const all = await cctList<WorkspaceMember>(NN.member, { workspace_id: workspaceId });
  return all.filter((m: any) => String(m.workspace_id) === String(workspaceId));
}

export async function addMember(
  workspaceId: string,
  userId: string,
  role: MemberRole,
  invitedBy?: string,
): Promise<string> {
  const { id } = await cctCreate(NN.member, {
    workspace_id: workspaceId,
    user_id: userId,
    role,
    status: "active",
    invited_by: invitedBy || "",
    joined_at: new Date().toISOString(),
  });
  return id;
}

export async function updateMemberRole(memberId: string, role: MemberRole) {
  await cctUpdate(NN.member, memberId, { role });
}

export async function removeMember(memberId: string) {
  await cctDelete(NN.member, memberId);
}

export async function listInvites(workspaceId: string): Promise<Invite[]> {
  const all = await cctList<Invite>(NN.invite, { workspace_id: workspaceId });
  return all.filter((i: any) => String(i.workspace_id) === String(workspaceId));
}

export async function createInvite(
  workspaceId: string,
  email: string,
  role: MemberRole,
  invitedBy: string,
  ttlDays = 7,
): Promise<Invite> {
  const token = rand();
  const expires = new Date(Date.now() + ttlDays * 86400_000).toISOString();
  const { id } = await cctCreate(NN.invite, {
    workspace_id: workspaceId,
    email,
    token,
    invited_by: invitedBy,
    role,
    expires_at: expires,
    status: "pending",
  });
  return { id, workspace_id: workspaceId, email, token, invited_by: invitedBy, role, expires_at: expires, status: "pending" };
}

export async function acceptInvite(inviteId: string, userId: string) {
  const invites = await cctList<Invite>(NN.invite);
  const inv = invites.find((i: any) => String(i.id) === String(inviteId));
  if (!inv) throw new Error("Invite not found");
  await addMember(inv.workspace_id, userId, inv.role, inv.invited_by);
  await cctUpdate(NN.invite, inviteId, { status: "accepted" });
}

export async function acceptInviteByToken(token: string, userId: string): Promise<Invite | null> {
  const invites = await cctList<Invite>(NN.invite);
  const inv = invites.find((i: any) => String(i.token) === String(token) && i.status === "pending");
  if (!inv) return null;
  if (inv.expires_at && new Date(inv.expires_at).getTime() < Date.now()) {
    await cctUpdate(NN.invite, inv.id, { status: "expired" });
    return null;
  }
  await addMember(inv.workspace_id, userId, inv.role, inv.invited_by);
  await cctUpdate(NN.invite, inv.id, { status: "accepted" });
  return inv;

export async function declineInvite(inviteId: string) {
  await cctUpdate(NN.invite, inviteId, { status: "declined" });
}

export async function revokeInvite(inviteId: string) {
  await cctDelete(NN.invite, inviteId);
}

/** Build a shareable invite URL from a token. */
export function buildInviteUrl(token: string): string {
  const base = window.location.origin;
  return `${base}/?__site=notchnote&invite=${token}`;
}
