import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Search, X, Heart, Trash2, KeyRound } from "lucide-react";
import { useSearchProfiles, useAddCaredOneToGroup, useUpdateCareGroup, useDeleteCareGroup } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

function useZ() {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  return (cn: string, en: string) => (isCN ? cn : en);
}

// ─── Settings Dialog ────────────────────────────────────────
export function GroupSettingsDialog({
  open, onOpenChange, activeGroup, activeGroupId, isOwner,
  updateGroup, deleteGroup, onDeleteSuccess, onLeaveGroup,
}: {
  open: boolean; onOpenChange: (o: boolean) => void;
  activeGroup: any; activeGroupId: string | null;
  isOwner: boolean; updateGroup: any; deleteGroup: any;
  onDeleteSuccess: () => void; onLeaveGroup: () => void;
}) {
  const { toast } = useToast();
  const Z = useZ();
  const [name, setName] = useState(activeGroup?.name || "");
  const [desc, setDesc] = useState(activeGroup?.description || "");
  const [isPrivate, setIsPrivate] = useState(activeGroup?.is_private || false);

  // Sync when dialog opens
  const handleOpenChange = (o: boolean) => {
    if (o && activeGroup) {
      setName(activeGroup.name);
      setDesc(activeGroup.description || "");
      setIsPrivate(activeGroup.is_private || false);
    }
    onOpenChange(o);
  };

  const handleSave = () => {
    if (!activeGroupId || !name.trim()) return;
    updateGroup.mutate({ id: activeGroupId, updates: { name, description: desc || null, is_private: isPrivate } }, {
      onSuccess: () => { onOpenChange(false); toast({ title: Z("小组已更新！", "Group updated!") }); },
    });
  };

  const handleDelete = () => {
    if (!activeGroupId) return;
    deleteGroup.mutate(activeGroupId, {
      onSuccess: () => { onOpenChange(false); onDeleteSuccess(); toast({ title: Z("小组已删除", "Group deleted") }); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{Z("小组设置", "Group Settings")}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div><Label>{Z("小组名称", "Group Name")}</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          <div><Label>{Z("描述", "Description")}</Label><Textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} /></div>
          <div className="flex items-center justify-between">
            <div>
              <Label>{Z("私密小组", "Private Group")}</Label>
              <p className="text-xs text-muted-foreground">{Z("私密小组将被隐藏，仅限受邀加入", "Private groups are hidden and invite-only")}</p>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>
          {/* Invite links are managed in the Members tab (CCT 160 + Rel 161). */}
          <Button variant="coral" className="w-full" onClick={handleSave} disabled={updateGroup.isPending || !name.trim()}>{Z("保存修改", "Save Changes")}</Button>
          {!isOwner && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">{Z("成员关系", "Membership")}</h4>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10">{Z("退出小组", "Leave Group")}</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{Z("确定要退出此小组？", "Leave this care group?")}</AlertDialogTitle>
                    <AlertDialogDescription>{Z("您将失去对所有小组内容的访问。可通过加入码或邀请重新加入。", "You will lose access to all group content. You can rejoin with a join code or invitation.")}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{Z("取消", "Cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={onLeaveGroup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{Z("退出小组", "Leave Group")}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          {isOwner && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-destructive mb-2">{Z("危险操作", "Danger Zone")}</h4>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full"><Trash2 className="h-4 w-4 mr-2" /> {Z("删除小组", "Delete Group")}</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{Z("确定要删除此小组？", "Delete this care group?")}</AlertDialogTitle>
                    <AlertDialogDescription>{Z("此操作不可撤销。所有小组数据（包括帖子、任务和消息）将被永久删除。", "This action cannot be undone. All group data including posts, tasks, and messages will be permanently deleted.")}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{Z("取消", "Cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{Z("删除小组", "Delete Group")}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Post Dialog ───────────────────────────────────────
export function EditPostDialog({
  post, onClose, updatePost,
}: {
  post: any; onClose: () => void; updatePost: any;
}) {
  const { toast } = useToast();
  const Z = useZ();
  const [content, setContent] = useState(post?.content || "");
  const [title, setTitle] = useState(post?.title || "");

  return (
    <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{Z("编辑帖子", "Edit Post")}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div><Label>{Z("标题", "Title")}</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder={Z("可选标题", "Optional title")} /></div>
          <div><Label>{Z("内容", "Content")}</Label><Textarea value={content} onChange={e => setContent(e.target.value)} rows={4} /></div>
          <Button variant="coral" className="w-full" onClick={() => {
            if (!post) return;
            updatePost.mutate({ id: post.id, updates: { content, title: title || null } }, {
              onSuccess: () => { onClose(); toast({ title: Z("帖子已更新！", "Post updated!") }); },
            });
          }} disabled={updatePost.isPending || !content.trim()}>{Z("保存修改", "Save Changes")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Cared One Dialog ───────────────────────────────────
export function AddCaredOneDialog({
  open, onOpenChange, activeGroupId,
}: {
  open: boolean; onOpenChange: (o: boolean) => void; activeGroupId: string | null;
}) {
  const { toast } = useToast();
  const Z = useZ();
  const [search, setSearch] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [skipInvitation, setSkipInvitation] = useState(false);
  const { data: searchResults } = useSearchProfiles(search);
  const addCaredOne = useAddCaredOneToGroup();

  const handleAdd = () => {
    if (!selectedPerson || !activeGroupId) return;
    addCaredOne.mutate({ groupId: activeGroupId, caredOneId: selectedPerson.id }, {
      onSuccess: () => {
        onOpenChange(false); setSelectedPerson(null); setSearch(""); setSkipInvitation(false);
        toast({ title: Z("已将被照护者加入小组！", "Cared one added to group!") });
      },
      onError: (err: any) => toast({ title: Z("添加失败", "Failed to add"), description: err.message, variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setSelectedPerson(null); setSearch(""); setSkipInvitation(false); } }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{Z("添加被照护者到小组", "Add Cared One to Group")}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>{Z("按姓名或邮箱搜索", "Search by name or email")}</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => { setSearch(e.target.value); setSelectedPerson(null); }} placeholder={Z("请输入至少2个字符...", "Type at least 2 characters...")} className="pl-9" />
            </div>
          </div>
          {search.length >= 2 && !selectedPerson && (
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {(searchResults || []).length > 0 ? (searchResults || []).map((p: any) => (
                <button key={p.id} className="w-full flex items-center gap-3 p-3 hover:bg-accent text-left border-b last:border-b-0 transition-colors" onClick={() => setSelectedPerson(p)}>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" /> : <span className="text-primary text-xs font-medium">{(p.full_name || p.email || "?")[0]}</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.full_name || p.first_name || Z("未填姓名", "No name")}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.email || p.user_name || ""}</p>
                  </div>
                </button>
              )) : <p className="p-3 text-sm text-muted-foreground text-center">{Z("未找到结果", "No results found")}</p>}
            </div>
          )}
          {selectedPerson && (
            <div className="rounded-lg border bg-muted/50 p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {selectedPerson.avatar_url ? <img src={selectedPerson.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <span className="text-primary font-medium">{(selectedPerson.full_name || "?")[0]}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{selectedPerson.full_name || Z("未填姓名", "No name")}</p>
                <p className="text-xs text-muted-foreground">{selectedPerson.email || ""}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedPerson(null)}><X className="h-3.5 w-3.5" /></Button>
            </div>
          )}
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
            <Checkbox id="skip-inv" checked={skipInvitation} onCheckedChange={(checked) => setSkipInvitation(checked === true)} className="mt-0.5" />
            <div>
              <Label htmlFor="skip-inv" className="text-sm font-medium cursor-pointer">{Z("跳过邀请", "Skip invitation")}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">{Z("适用于无法使用手机的长辈或儿童；勾选后将直接加入为活跃成员。", "Check this for elderly or children who can't operate a phone. They'll be added as active members immediately.")}</p>
            </div>
          </div>
          <Button variant="coral" className="w-full" onClick={handleAdd} disabled={!selectedPerson || addCaredOne.isPending}>
            {addCaredOne.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Heart className="h-4 w-4 mr-2" />}
            {Z("添加为被照护者", "Add as Cared One")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
