import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Link2, Copy, ChevronRight, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCareGroupsWordPress, fetchCareGroupMembersWordPress, createCareGroupWordPress } from "@/features/care-groups/source.wordpress";
import { createGroupInviteWordPress, joinGroupByAnyCodeWordPress } from "@/features/care-groups/source.wordpress-extended";

const CIRCLE_KEY = "notchsafety:circle";

/** Circle management for NotchSafety — create, join, invite, see who's in. */
export default function SafetyCircle() {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  const L = (cn: string, en: string) => (zh ? cn : en);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();

  const [selected, setSelected] = useState<string | null>(() => {
    try { return localStorage.getItem(CIRCLE_KEY); } catch { return null; }
  });
  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const circles = useQuery({ queryKey: ["nn-circles"], queryFn: fetchCareGroupsWordPress });

  useEffect(() => {
    const list = circles.data || [];
    if (!list.length) return;
    if (!selected || !list.some((c: any) => String(c.id) === String(selected))) {
      setSelected(String(list[0].id));
    }
  }, [circles.data, selected]);

  useEffect(() => {
    if (selected) { try { localStorage.setItem(CIRCLE_KEY, selected); } catch { /* ignore */ } }
  }, [selected]);

  const members = useQuery({
    queryKey: ["nn-members", selected],
    enabled: !!selected,
    queryFn: () => fetchCareGroupMembersWordPress(selected as string),
  });

  const activeCircle = useMemo(
    () => (circles.data || []).find((c: any) => String(c.id) === String(selected)),
    [circles.data, selected],
  );

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const created = await createCareGroupWordPress({ name: newName.trim(), displayName: user?.full_name || undefined });
      setNewName("");
      setCreateOpen(false);
      await qc.invalidateQueries({ queryKey: ["nn-circles"] });
      if (created?.id) setSelected(String(created.id));
      toast({ title: L("圈子已创建", "Circle created") });
    } catch (e: any) {
      toast({ title: L("创建失败", "Could not create circle"), description: e?.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setBusy(true);
    try {
      await joinGroupByAnyCodeWordPress(joinCode.trim(), user?.full_name || undefined);
      setJoinCode("");
      setJoinOpen(false);
      await qc.invalidateQueries({ queryKey: ["nn-circles"] });
      toast({ title: L("已加入圈子", "You're in") });
    } catch (e: any) {
      toast({ title: L("加入失败", "Could not join"), description: e?.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const handleInvite = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const invite = await createGroupInviteWordPress({ groupId: selected, source: "app native generated" });
      const token = invite?.token || invite?.code;
      if (!token) throw new Error(L("未能生成邀请链接。", "The invite link could not be generated."));
      const url = `${window.location.origin}/join/${token}?__site=notchsafety`;
      setInviteLink(url);
      try { await navigator.clipboard.writeText(url); toast({ title: L("邀请链接已复制", "Invite link copied") }); }
      catch { toast({ title: L("邀请链接已生成", "Invite link ready") }); }
    } catch (e: any) {
      toast({ title: L("生成失败", "Could not create invite"), description: e?.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-xl font-bold md:text-2xl">{L("我的圈子", "My circle")}</h1>

        <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2"><LogIn className="h-4 w-4" />{L("用邀请码加入", "Join with code")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{L("加入圈子", "Join a circle")}</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="nn-join">{L("邀请码或邀请链接", "Invite code or link")}</Label>
              <Input id="nn-join" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder={L("粘贴到这里", "Paste it here")} />
            </div>
            <DialogFooter>
              <Button onClick={handleJoin} disabled={busy || !joinCode.trim()}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{L("加入", "Join")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />{L("新建圈子", "New circle")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{L("新建圈子", "New circle")}</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="nn-name">{L("圈子名称", "Circle name")}</Label>
              <Input id="nn-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={L("例如：我家", "e.g. Our family")} />
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={busy || !newName.trim()}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{L("创建", "Create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {circles.isLoading ? (
        <Skeleton className="h-24 w-full rounded-2xl" />
      ) : (circles.data || []).length === 0 ? (
        <Card className="border-transparent card-elevated">
          <CardContent className="p-8 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium">{L("你还没有圈子", "You don't have a circle yet")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {L("创建一个，然后把家人邀请进来。", "Create one, then invite your family in.")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {(circles.data || []).length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {(circles.data || []).map((c: any) => (
                <Button
                  key={c.id}
                  size="sm"
                  variant={String(c.id) === String(selected) ? "default" : "outline"}
                  className="shrink-0 rounded-full"
                  onClick={() => setSelected(String(c.id))}
                >
                  {c.name}
                </Button>
              ))}
            </div>
          )}

          <Card className="border-transparent card-elevated">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{activeCircle?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {L(`${(members.data || []).length} 位成员`, `${(members.data || []).length} members`)}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleInvite} disabled={busy}>
                  <Link2 className="h-4 w-4" />{L("邀请家人", "Invite")}
                </Button>
              </div>
              {inviteLink && (
                <div className="flex items-center gap-2 rounded-xl bg-muted p-3">
                  <span className="flex-1 truncate text-xs">{inviteLink}</span>
                  <Button
                    variant="ghost" size="icon" aria-label={L("复制链接", "Copy link")}
                    onClick={() => { navigator.clipboard.writeText(inviteLink); toast({ title: L("已复制", "Copied") }); }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2">
            {members.isLoading
              ? [0, 1].map((i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
              : (members.data || []).map((m: any) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => navigate(`/member/${m.id}`)}
                    className="flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left transition-colors hover:bg-accent"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                      {(m.display_name || "?").slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{m.display_name || L("家人", "Family member")}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {m.invitation_status === "pending" ? L("等待接受邀请", "Invitation pending") : L("在圈子中", "In this circle")}
                      </span>
                    </span>
                    {m.is_owner && <Badge variant="secondary">{L("创建者", "Owner")}</Badge>}
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
          </div>
        </>
      )}
    </div>
  );
}
