import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserPlus, Mail, Clock, X, Heart, MoreVertical, Trash2, Link2, Copy, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useGroupInvites, useCreateGroupInvite, useUpdateGroupInvite, useDeleteGroupInvite, useSearchProfiles, useUserCaredOnes } from "@/hooks/use-care-data";
import type { InvitedAs } from "@/features/care-groups/source.wordpress-extended";
import { careGroupLink, randomJoinCode, cleanJoinCodeInput, JOIN_CODE_MAX_LENGTH } from "@/features/care-groups/join-link";

interface InviteMembersTabProps {
  members: any[];
  activeGroupId: string | null;
  isAdmin: boolean;
  pendingInvitations: any[];
  inviteToGroup: any;
  cancelInvitation: any;
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

  // CCT 200 rows: join codes (a64 Pass code) and older invite links.
  const { data: invites = [] } = useGroupInvites(activeGroupId);
  const legacyLinks = invites.filter((i: any) => i.kind !== "code");
  const joinCodes = invites.filter((i: any) => i.kind === "code");
  const createInvite = useCreateGroupInvite();
  const [newCode, setNewCode] = useState("");
  const [newCodeName, setNewCodeName] = useState("");
  const [newCodeExpires, setNewCodeExpires] = useState("");
  const [newCodeMax, setNewCodeMax] = useState("");
  const [newCodeAs, setNewCodeAs] = useState<InvitedAs>("normal group member");
  const addJoinCode = () => {
    if (!activeGroupId) return;
    const code = newCode.trim() || randomJoinCode();
    createInvite.mutate({
      groupId: activeGroupId, kind: "code", joinCode: code, name: newCodeName.trim(), invitedAs: newCodeAs,
      expiresAt: newCodeExpires ? new Date(newCodeExpires).toISOString() : "",
      maxUses: Number(newCodeMax || 0),
    }, {
      onSuccess: () => { setNewCode(""); setNewCodeName(""); setNewCodeExpires(""); setNewCodeMax(""); toast({ title: Z("加入码已添加", "Join code added") }); },
      onError: (err: any) => toast({ title: Z("添加失败", "Could not add"), description: err?.message, variant: "destructive" }),
    });
  };
  const updateInvite = useUpdateGroupInvite();
  const deleteInvite = useDeleteGroupInvite();

  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);
  const groupLink = careGroupLink(origin, activeGroupId);
  const emailMode = !invitePerson && inviteEmail.includes("@");

  const roleLabel = (r: string) => (r === "owner" ? Z("拥有者", "Owner") : r === "admin" ? Z("管理员", "Admin") : Z("普通成员", "Member"));

  /**
   * Every invitation hands out the same group link. App users also get a
   * personal invitation (with the chosen role) that shows when they open it;
   * email addresses get the link plus the join code in the email text.
   */
  const invite = (target: { userId?: string | undefined; email?: string | undefined }) => {
    if (!activeGroupId) return;
    const invitedAs: InvitedAs = target.email ? "normal group member" : inviteAs;
    inviteToGroup.mutate({ groupId: activeGroupId, ...target, invitedAs }, {
      onSuccess: (res: any) => {
        setInvitePerson(null); setInviteSearch(""); setInviteEmail("");
        navigator.clipboard?.writeText(res?.url || "").catch(() => {});
        toast({
          title: Z("邀请已发出", "Invitation sent"),
          description: target.email
            ? (res?.email === "sent"
                ? Z("群组链接和加入码已发到该邮箱，链接也已复制到剪贴板。", "The group link and join code were emailed to them; the link is also on your clipboard.")
                : Z("邮件没能发出。群组链接已复制到剪贴板，请手动发给对方，并告诉对方加入码。", "The email could not be sent. The group link is on your clipboard — send it yourself and tell them the join code."))
            : Z("对方会在通知里收到群组链接，打开后点「接受邀请」即可。", "They'll get the group link in their notifications and can tap \u201cAccept invitation\u201d."),
        });
      },
      onError: (err: any) => toast({
        title: Z("邀请失败", "Could not invite"),
        description: /already in the group/i.test(String(err?.message)) ? Z("对方已经在群里了。", "This person is already in the group.") : err.message,
        variant: "destructive",
      }),
    });
  };

  const handleInvite = () => {
    if (invitePerson) return invite({ userId: invitePerson.id });
    if (inviteEmail.includes("@")) return invite({ email: inviteEmail.trim() });
  };

  const copyGroupLink = () => {
    if (!groupLink) return;
    navigator.clipboard?.writeText(groupLink);
    toast({ title: Z("群组链接已复制", "Group link copied") });
  };

  const toggleRevoke = (inv: any) => {
    updateInvite.mutate({ id: inv.id, isRevoked: !inv.is_revoked }, {
      onSuccess: () => toast({ title: inv.is_revoked ? Z("旧链接已重新启用", "Older link reactivated") : Z("旧链接已撤销", "Older link revoked") }),
    });
  };

  const handleDeleteInvite = (inv: any) => {
    deleteInvite.mutate({ id: inv.id }, { onSuccess: () => toast({ title: Z("旧链接已删除", "Older link deleted") }) });
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
              <Select value={emailMode ? "normal group member" : inviteAs} onValueChange={(v) => setInviteAs(v as InvitedAs)} disabled={emailMode}>
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
              {emailMode
                ? Z("邮箱邀请：对方收到群组链接和加入码，注册后以普通成员加入，之后可在成员里调整身份。", "Email invite: they get the group link and the join code, and join as a member after signing up. You can change their role later.")
                : Z("发的都是同一个群组链接。注册用户在通知里收到，打开后会看到这份邀请和您选的身份，点「接受邀请」就进群。", "Everyone gets the same group link. App users find it in their notifications; opening it shows this invitation with the role you chose.")}
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
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2 mb-2"><Link2 className="h-4 w-4" /> {Z("群组链接", "Group link")}</h4>
            <div className="flex gap-2">
              <Input readOnly value={groupLink} aria-label={Z("群组链接", "Group link")} className="flex-1 font-mono text-xs h-9" onFocus={(e) => e.currentTarget.select()} />
              <Button type="button" size="sm" variant="outline" disabled={!groupLink} onClick={copyGroupLink}>
                <Copy className="h-3.5 w-3.5 mr-1" /> {Z("复制", "Copy")}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {Z("每个群组只有这一个链接，链接里没有加入码。对方打开后输入加入码，或者申请加入；加入码在下方。", "This group's one link — it never contains the join code. People who open it type the join code or ask to join. Join codes are below.")}
            </p>
          </div>

          <div className="border-t pt-3">
            <h4 className="text-sm font-medium text-foreground mb-1">{Z("加入码", "Join codes")}</h4>
            <p className="text-[11px] text-muted-foreground mb-2">{Z("一个群组可以有多个加入码。每个可以不设期限、不限人数，也可以设到期时间或最多使用人数。对方打开群组链接后输入任意一个有效加入码即可加入。", "A group can have several join codes. Each can have no expiry and no limit, or an expiry time or a maximum number of uses. People who open the group link can join with any valid code.")}</p>
            <div className="space-y-2 mb-3">
              {joinCodes.map((inv: any) => {
                const status = inv.is_revoked ? Z("已停用", "Off") : inv.is_expired ? Z("已过期", "Expired") : inv.is_exhausted ? Z("已用完", "Used up") : Z("有效", "Active");
                return (
                  <div key={inv.id} data-testid="join-code-row" className="rounded-lg border p-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-foreground">{inv.join_code}</span>
                        <Badge variant={inv.is_active ? "default" : "outline"} className="text-[10px] h-4">{status}</Badge>
                        {inv.name && <span className="text-xs text-muted-foreground truncate">{inv.name}</span>}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {roleLabel(inv.invited_as)} · {inv.expires_at ? Z(`到期 ${new Date(inv.expires_at).toLocaleString()}`, `Expires ${new Date(inv.expires_at).toLocaleString()}`) : Z("不过期", "No expiry")} · {inv.has_max_uses ? `${inv.use_count}/${inv.max_uses}` : Z(`已用 ${inv.use_count} 次 · 不限次数`, `Used ${inv.use_count} · no limit`)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={Z("复制加入码", "Copy join code")} onClick={() => { navigator.clipboard?.writeText(inv.join_code); toast({ title: Z("已复制", "Copied") }); }}><Copy className="h-4 w-4" /></Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" aria-label={Z("加入码操作", "Join code actions")}><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateInvite.mutate({ id: inv.id, isRevoked: !inv.is_revoked })}><Ban className="h-3.5 w-3.5 mr-2" /> {inv.is_revoked ? Z("重新启用", "Turn on") : Z("停用", "Turn off")}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteInvite.mutate({ id: inv.id })}><Trash2 className="h-3.5 w-3.5 mr-2" /> {Z("删除", "Delete")}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="rounded-lg border p-2 space-y-2">
              <div className="flex gap-2">
                <Input value={newCode} maxLength={JOIN_CODE_MAX_LENGTH} aria-label={Z("新加入码", "New join code")} onChange={e => setNewCode(cleanJoinCodeInput(e.target.value))} placeholder={Z("留空自动生成 6 位数字", "Leave empty for 6 random digits")} />
                <Input value={newCodeName} onChange={e => setNewCodeName(e.target.value)} placeholder={Z("名称（可不填）", "Name (optional)")} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input type="datetime-local" value={newCodeExpires} aria-label={Z("到期时间（可不填）", "Expires (optional)")} onChange={e => setNewCodeExpires(e.target.value)} />
                <Input type="number" min={1} value={newCodeMax} onChange={e => setNewCodeMax(e.target.value)} placeholder={Z("最多使用人数（可不填）", "Max uses (optional)")} />
                <Select value={newCodeAs} onValueChange={(v) => setNewCodeAs(v as InvitedAs)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal group member">{Z("普通成员", "Member")}</SelectItem>
                    <SelectItem value="admin">{Z("管理员", "Admin")}</SelectItem>
                    <SelectItem value="owner">{Z("拥有者", "Owner")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="w-full" onClick={addJoinCode} disabled={createInvite.isPending}>{Z("添加加入码", "Add join code")}</Button>
            </div>
          </div>

          {legacyLinks.length > 0 && (
            <div className="border-t pt-3">
              <h4 className="text-sm font-medium text-foreground mb-1">{Z("以前发出的旧邀请链接", "Older invite links already sent")}</h4>
              <p className="text-[11px] text-muted-foreground mb-2">{Z("这些旧链接还能用，不会再新建。不想让它们继续生效可以撤销或删除。", "These older links still work; no new ones are made. Revoke or delete any you no longer want.")}</p>
              <div className="space-y-2">
                {legacyLinks.map((inv: any) => {
                  const status = inv.is_revoked ? Z("已撤销", "Revoked") : inv.is_expired ? Z("已过期", "Expired") : inv.is_exhausted ? Z("已用完", "Used up") : Z("有效", "Active");
                  return (
                    <div key={inv.id} className="rounded-lg border p-2 flex items-center justify-between gap-2 bg-muted/30">
                      <div className="min-w-0 flex items-center gap-2">
                        <p className="text-sm text-foreground truncate">{inv.name || inv.token}</p>
                        <Badge variant={inv.is_active ? "default" : "outline"} className="text-[10px] h-4">{status}</Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label={Z("旧链接操作", "Older link actions")}><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleRevoke(inv)}><Ban className="h-3.5 w-3.5 mr-2" /> {inv.is_revoked ? Z("重新启用", "Reactivate") : Z("撤销", "Revoke")}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteInvite(inv)}><Trash2 className="h-3.5 w-3.5 mr-2" /> {Z("删除", "Delete")}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
                    <p className="text-sm font-medium text-foreground">{inv.name || inv.invited_email || Z("未填姓名", "No name")}</p>
                    <p className="text-xs text-muted-foreground">{Z(`等待对方接受 · 身份：${roleLabel(inv.role)}`, `Waiting to accept · ${roleLabel(inv.role)}`)}</p>
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
