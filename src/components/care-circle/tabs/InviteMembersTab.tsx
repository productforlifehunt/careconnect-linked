import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserPlus, Mail, Clock, X, Plus, Heart, MoreVertical, Trash2, Link2, Copy, Ban, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useGroupInvites, useCreateGroupInvite, useUpdateGroupInvite, useDeleteGroupInvite, useSearchProfiles, useUserCaredOnes } from "@/hooks/use-care-data";
import { formatDate, formatDateTime } from "@/lib/locale";
import type { InvitedAs } from "@/features/care-groups/source.wordpress-extended";

interface InviteMembersTabProps {
  members: any[];
  activeGroupId: string | null;
  isAdmin: boolean;
  pendingInvitations: any[];
  inviteToGroup: any;
  cancelInvitation: any;
}

function formatDateTimeLocal(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function InviteMembersTab({
  members, activeGroupId, isAdmin, pendingInvitations, inviteToGroup, cancelInvitation,
}: InviteMembersTabProps) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);

  const [inviteSearch, setInviteSearch] = useState("");
  const [invitePerson, setInvitePerson] = useState<any>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteAs, setInviteAs] = useState<InvitedAs>("normal group member");
  const { data: inviteSearchResults } = useSearchProfiles(inviteSearch);
  const { data: myCaredOnes } = useUserCaredOnes();

  const { data: inviteLinks = [] } = useGroupInvites(activeGroupId);
  const createInvite = useCreateGroupInvite();
  const updateInvite = useUpdateGroupInvite();
  const deleteInvite = useDeleteGroupInvite();
  const [createInviteOpen, setCreateInviteOpen] = useState(false);
  const [editInvite, setEditInvite] = useState<any>(null);
  const [linkName, setLinkName] = useState("");
  const [linkNote, setLinkNote] = useState("");
  const [linkToken, setLinkToken] = useState("");
  const [linkExpires, setLinkExpires] = useState("");
  const [linkMaxUses, setLinkMaxUses] = useState("0");
  const [linkInvitedAs, setLinkInvitedAs] = useState<InvitedAs>("normal group member");

  const invitedAsLabel = (v: InvitedAs) =>
    v === "owner" ? Z("拥有者", "Owner") : v === "admin" ? Z("管理员", "Admin") : Z("普通成员", "Member");

  /**
   * Every invitation is an invite link. Inviting an app user sends them the link
   * in their notifications; inviting an email address emails the link. Nobody is
   * added to the group until they open the link and fill in their in-group name.
   */
  const invite = (target: { userId?: string; email?: string }) => {
    if (!activeGroupId) return;
    inviteToGroup.mutate({ groupId: activeGroupId, ...target, invitedAs: inviteAs }, {
      onSuccess: (res: any) => {
        setInvitePerson(null); setInviteSearch(""); setInviteEmail("");
        navigator.clipboard?.writeText(res?.url || "").catch(() => {});
        toast({
          title: Z("邀请已发出", "Invitation sent"),
          description: target.email
            ? (res?.email === "sent"
                ? Z("邀请链接已发送到该邮箱，链接也已复制到剪贴板。", "The invite link was emailed to them, and copied to your clipboard.")
                : Z("邮件没能发出。邀请链接已复制到剪贴板，请手动发送给对方。", "The email could not be sent. The invite link is copied to your clipboard — please send it to them yourself."))
            : Z("对方会在通知里收到邀请链接，链接也已复制到剪贴板。", "They will find the invite link in their notifications, and it is copied to your clipboard."),
        });
      },
      onError: (err: any) => toast({ title: Z("邀请失败", "Could not invite"), description: err.message, variant: "destructive" }),
    });
  };

  const handleInvite = () => {
    if (invitePerson) return invite({ userId: invitePerson.id });
    if (inviteEmail.includes("@")) return invite({ email: inviteEmail.trim() });
  };

  const openCreateInvite = () => {
    setEditInvite(null);
    setLinkName(""); setLinkNote(""); setLinkToken(""); setLinkExpires(""); setLinkMaxUses("0");
    setLinkInvitedAs("normal group member");
    setCreateInviteOpen(true);
  };

  const openEditInvite = (inv: any) => {
    setEditInvite(inv);
    setLinkName(inv.name || "");
    setLinkNote(inv.note || "");
    setLinkToken(inv.token || "");
    setLinkExpires(formatDateTimeLocal(inv.expires_at));
    setLinkMaxUses(String(inv.max_uses ?? 0));
    setLinkInvitedAs((inv.invited_as as InvitedAs) || "normal group member");
    setCreateInviteOpen(true);
  };

  const handleSaveInvite = () => {
    if (!activeGroupId || !linkName.trim()) return;
    const expiresAt = linkExpires ? new Date(linkExpires).toISOString() : null;
    const maxUses = Math.max(0, Number(linkMaxUses) || 0);
    const trimmedToken = linkToken.trim();

    // Soft duplicate check — tokens are stored normalized (lowercase) under the hood.
    if (trimmedToken) {
      const normalized = trimmedToken.toLowerCase();
      const clash = (inviteLinks || []).some(
        (i: any) => (i.token || "").toLowerCase() === normalized && i.id !== editInvite?.id
      );
      if (clash) {
        toast({
          title: Z("该代码已被占用", "That code is already taken"),
          description: Z("请换一个代码，或留空让系统自动生成。", "Please pick a different code, or leave it blank to auto-generate one."),
          variant: "destructive",
        });
        return;
      }
    }

    if (editInvite) {
      updateInvite.mutate(
        { id: editInvite.id, groupId: activeGroupId, name: linkName.trim(), note: linkNote, token: trimmedToken || undefined, expiresAt, maxUses, invitedAs: linkInvitedAs },
        {
          onSuccess: () => { setCreateInviteOpen(false); toast({ title: Z("邀请链接已更新", "Invite link updated") }); },
          onError: (err: any) => toast({ title: Z("更新失败", "Could not update"), description: err.message, variant: "destructive" }),
        }
      );
    } else {
      createInvite.mutate(
        { groupId: activeGroupId, name: linkName.trim(), note: linkNote, token: trimmedToken || undefined, expiresAt, maxUses, invitedAs: linkInvitedAs, source: "custom" },
        {
          onSuccess: () => { setCreateInviteOpen(false); toast({ title: Z("邀请链接已创建", "Invite link created") }); },
          onError: (err: any) => toast({ title: Z("创建失败", "Could not create"), description: err.message, variant: "destructive" }),
        }
      );
    }
  };

  const copyCode = (token: string) => {
    navigator.clipboard?.writeText(token);
    toast({ title: Z("邀请码已复制！", "Invite code copied!") });
  };

  const copyLink = (token: string) => {
    navigator.clipboard?.writeText(`${window.location.origin}/join/${token}`);
    toast({ title: Z("邀请链接已复制！", "Invite link copied!") });
  };

  const toggleRevoke = (inv: any) => {
    updateInvite.mutate({ id: inv.id, isRevoked: !inv.is_revoked }, {
      onSuccess: () => toast({ title: inv.is_revoked ? Z("邀请链接已重新启用", "Invite link reactivated") : Z("邀请链接已撤销", "Invite link revoked") }),
    });
  };

  const handleDeleteInvite = (inv: any) => {
    deleteInvite.mutate({ id: inv.id }, { onSuccess: () => toast({ title: Z("邀请链接已删除", "Invite link deleted") }) });
  };

  if (!isAdmin) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {Z("只有群组拥有者和管理员可以邀请成员。", "Only group owners and admins can invite members.")}
      </p>
    );
  }

  return (
    <div>
      <Card className="border-transparent card-elevated mb-4">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" /> {Z("邀请成员", "Invite Members")}</CardTitle></CardHeader>
        <CardContent className="pt-2 space-y-4">
          <div className="space-y-2">
            <Input
              value={invitePerson ? (invitePerson.full_name || invitePerson.email || "") : inviteSearch}
              onChange={e => { setInviteSearch(e.target.value); setInvitePerson(null); }}
              placeholder={Z("搜索已注册用户（至少2个字符）……", "Search registered users (at least 2 characters)...")}
              className="flex-1"
            />
            {inviteSearch.length >= 2 && !invitePerson && (
              <div className="border rounded-lg divide-y max-h-56 overflow-auto">
                {(inviteSearchResults || []).length > 0 ? (inviteSearchResults || []).map((p: any) => (
                  <button
                    key={p.id}
                    data-testid="invite-search-result"
                    className="w-full text-left px-3 py-2 hover:bg-muted/60"
                    onClick={() => { setInvitePerson(p); }}
                  >
                    <span className="text-sm font-medium text-foreground">{p.full_name || Z("未填姓名", "No name")}</span>
                    {p.email && <span className="block text-xs text-muted-foreground">{p.email}</span>}
                  </button>
                )) : (
                  <p className="px-3 py-2 text-xs text-muted-foreground">{Z("未找到用户", "No users found")}</p>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0">{Z("邀请身份", "Invite as")}</span>
              <Select value={inviteAs} onValueChange={(v) => setInviteAs(v as InvitedAs)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal group member">{Z("普通成员", "Member")}</SelectItem>
                  <SelectItem value="admin">{Z("管理员", "Admin")}</SelectItem>
                  <SelectItem value="owner">{Z("拥有者", "Owner")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              type="email"
              value={inviteEmail}
              onChange={e => { setInviteEmail(e.target.value); if (e.target.value) setInvitePerson(null); }}
              placeholder={Z("或者填写邮箱地址，把邀请发给还没注册的人", "Or type an email address to invite someone not signed up yet")}
            />
            <Button
              variant="coral"
              onClick={handleInvite}
              disabled={(!invitePerson && !inviteEmail.includes("@")) || inviteToGroup.isPending}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-1" /> {Z("发出邀请", "Send invitation")}
            </Button>
            <p className="text-[11px] text-muted-foreground">
              {Z("邀请会生成一个专属链接：注册用户在通知里收到，邮箱地址会收到邮件。对方打开链接、填写群内显示名后才正式入组。", "Each invitation creates its own link: app users get it in their notifications, email addresses get it by email. They join once they open the link and enter their in-group name.")}
            </p>
          </div>

          <div className="border-t pt-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2 mb-2"><Heart className="h-4 w-4" /> {Z("从我的被护理者中邀请", "Invite from my cared ones")}</h4>
            {(myCaredOnes || []).length === 0 ? (
              <p className="text-xs text-muted-foreground">{Z("你还没有添加被护理者。", "You have no cared ones yet.")}</p>
            ) : (
              <div className="border rounded-lg divide-y max-h-56 overflow-auto">
                {(myCaredOnes || []).map((c: any) => {
                  const person = c.cared_one || {};
                  const id = String(person.id || c.user_id);
                  const name = person.full_name || Z("被护理者", "Cared one");
                  const already = (members || []).some((m: any) => String(m.user_id || m.id || "").replace(/^wp-/, "") === id.replace(/^wp-/, ""));
                  return (
                    <div key={id} className="flex items-center gap-3 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{name}</p>
                        <p className="text-xs text-muted-foreground truncate">{person.email || ""}</p>
                      </div>
                      <Button size="sm" variant="outline" disabled={already || inviteToGroup.isPending}
                        onClick={() => invite({ userId: id })}>
                        {already ? Z("已在群组", "In group") : Z("邀请", "Invite")}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><Link2 className="h-4 w-4" /> {Z("邀请链接", "Invite Links")}</h4>
              <Button size="sm" variant="outline" onClick={openCreateInvite}><Plus className="h-3.5 w-3.5 mr-1" /> {Z("新建链接", "New link")}</Button>
            </div>
            {inviteLinks.length === 0 ? (
              <p className="text-xs text-muted-foreground">{Z("还没有邀请链接。创建一个分享给家人或护理人员。", "No invite links yet. Create one to share a join URL with family or care staff.")}</p>
            ) : (
              <div className="space-y-2">
                {inviteLinks.map((inv: any) => {
                  const link = `${window.location.origin}/join/${inv.token}`;
                  const status = inv.is_revoked ? Z("已撤销", "Revoked") : inv.is_expired ? Z("已过期", "Expired") : inv.is_exhausted ? Z("已用完", "Used up") : Z("有效", "Active");
                  return (
                    <div key={inv.id} className="rounded-lg border p-3 space-y-2 bg-muted/30">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-foreground truncate">{inv.name || Z("邀请链接", "Invite link")}</p>
                            <Badge variant={inv.is_active ? "default" : "outline"} className="text-[10px] h-4">{status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {inv.expires_at ? Z(`过期时间：${formatDateTime(inv.expires_at, "zh-CN")}`, `Expires ${formatDateTime(inv.expires_at)}`) : Z("永不过期", "Never expires")}
                            {" · "}
                            {inv.max_uses > 0 ? Z(`已使用 ${inv.use_count}/${inv.max_uses}`, `${inv.use_count}/${inv.max_uses} uses`) : Z(`已使用 ${inv.use_count} 次（无限）`, `${inv.use_count} uses (unlimited)`)}
                            {" · "}
                            {Z(`加入身份：${invitedAsLabel(inv.invited_as)}`, `Joins as ${invitedAsLabel(inv.invited_as)}`)}
                          </p>
                          {inv.note && <p className="text-xs text-muted-foreground truncate">{inv.note}</p>}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditInvite(inv)}><Pencil className="h-3.5 w-3.5 mr-2" /> {Z("编辑", "Edit")}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleRevoke(inv)}><Ban className="h-3.5 w-3.5 mr-2" /> {inv.is_revoked ? Z("重新启用", "Reactivate") : Z("撤销", "Revoke")}</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteInvite(inv)}><Trash2 className="h-3.5 w-3.5 mr-2" /> {Z("删除", "Delete")}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground w-16 shrink-0">{Z("邀请码", "Code")}</span>
                          <Input readOnly value={inv.token} className="flex-1 font-mono text-xs h-8" onFocus={(e) => e.currentTarget.select()} />
                          <Button type="button" size="sm" variant="outline" onClick={() => copyCode(inv.token)}>
                            <Copy className="h-3.5 w-3.5 mr-1" /> {Z("复制", "Copy")}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground w-16 shrink-0">{Z("链接", "Link")}</span>
                          <Input readOnly value={link} className="flex-1 font-mono text-xs h-8" onFocus={(e) => e.currentTarget.select()} />
                          <Button type="button" size="sm" variant="outline" onClick={() => copyLink(inv.token)}>
                            <Copy className="h-3.5 w-3.5 mr-1" /> {Z("复制", "Copy")}
                          </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {Z("两种方式都可以：把链接发出去，或者让对方在「加入护理小组」里输入邀请码。", "Either works: send the link, or have them type the code in \u201cJoin a care group\u201d.")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Dialog open={createInviteOpen} onOpenChange={setCreateInviteOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>{editInvite ? Z("编辑邀请链接", "Edit invite link") : Z("创建邀请链接", "Create invite link")}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>{Z("名称 *", "Name *")}</Label>
                  <Input value={linkName} onChange={e => setLinkName(e.target.value)} placeholder={Z("例如：家庭链接、夜班护士", "e.g. Family link, Night nurses")} />
                  <p className="text-xs text-muted-foreground mt-1">{Z("用于区分不同链接的标签。", "A label so you can tell links apart.")}</p>
                </div>
                <div>
                  <Label>{Z("自定义代码", "Custom code")}</Label>
                  <Input value={linkToken} onChange={e => setLinkToken(e.target.value.replace(/\s+/g, ""))} placeholder={Z("留空则自动生成", "Leave blank to auto-generate")} />
                  <p className="text-xs text-muted-foreground mt-1">{Z("可选 — 让它好记，例如 ", "Optional — make it memorable, e.g. ")}<code>moms-team-2026</code>{Z("。", ".")}</p>
                </div>
                <div>
                  <Label>{Z("备注", "Note")}</Label>
                  <Input value={linkNote} onChange={e => setLinkNote(e.target.value)} placeholder={Z("给自己看的备注，例如：给二姨一家", "A note for yourself, e.g. for my aunt's family")} />
                </div>
                <div>
                  <Label>{Z("用这个链接加入的身份", "People joining with this link become")}</Label>
                  <Select value={linkInvitedAs} onValueChange={(v) => setLinkInvitedAs(v as InvitedAs)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal group member">{Z("普通成员", "Member")}</SelectItem>
                      <SelectItem value="admin">{Z("管理员", "Admin")}</SelectItem>
                      <SelectItem value="owner">{Z("拥有者", "Owner")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{Z("过期时间", "Expires at")}</Label>
                  <Input type="datetime-local" value={linkExpires} onChange={e => setLinkExpires(e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-1">{Z("留空表示永不过期。", "Leave blank for no expiry.")}</p>
                </div>
                <div>
                  <Label>{Z("最大使用次数", "Max uses")}</Label>
                  <Input type="number" min={0} value={linkMaxUses} onChange={e => setLinkMaxUses(e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-1">{Z("填 0 表示不限次数。", "Use 0 for unlimited.")}</p>
                </div>
                <Button variant="coral" className="w-full" onClick={handleSaveInvite}
                  disabled={!linkName.trim() || createInvite.isPending || updateInvite.isPending}>
                  {editInvite ? Z("保存更改", "Save changes") : Z("创建链接", "Create link")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {(pendingInvitations || []).length > 0 && (
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Clock className="h-4 w-4 text-warning" /> {Z(`待处理邀请（${(pendingInvitations || []).length}）`, `Pending Invitations (${(pendingInvitations || []).length})`)}</h3>
          <div className="space-y-2">
            {(pendingInvitations || []).map((inv: any) => (
              <Card key={inv.id} className="border-transparent card-elevated border-l-4 border-l-warning">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{inv.invitee_email || inv.invited_email || Z("未知", "Unknown")}</p>
                    <p className="text-xs text-muted-foreground">{Z(`邀请于 ${formatDate(inv.created_at, "zh-CN", { month: "short", day: "numeric" })}`, `Invited ${formatDate(inv.created_at, "en", { month: "short", day: "numeric" })}`)}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => cancelInvitation.mutate(inv.id)}><X className="h-4 w-4 mr-1" /> {Z("取消", "Cancel")}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
