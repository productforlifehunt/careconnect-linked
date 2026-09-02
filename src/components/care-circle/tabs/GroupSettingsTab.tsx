import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Settings, Trash2 } from "lucide-react";
import { useUpdateMyGroupDisplayName } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface GroupSettingsTabProps {
  activeGroup: any;
  activeGroupId: string | null;
  isAdmin: boolean;
  isOwner: boolean;
  myDisplayName: string;
  updateGroup: any;
  deleteGroup: any;
  onDeleteSuccess: () => void;
  onLeaveGroup: () => void;
}

/** Same功能 as the old settings dialog, rendered inline as a tab. */
export function GroupSettingsTab({
  activeGroup, activeGroupId, isAdmin, isOwner, myDisplayName,
  updateGroup, deleteGroup, onDeleteSuccess, onLeaveGroup,
}: GroupSettingsTabProps) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);

  const [name, setName] = useState(activeGroup?.name || "");
  const [desc, setDesc] = useState(activeGroup?.description || "");
  const [isPrivate, setIsPrivate] = useState(!!activeGroup?.is_private);
  const [myName, setMyName] = useState(myDisplayName);
  const updateMyName = useUpdateMyGroupDisplayName();

  // Always mirror the currently selected group.
  useEffect(() => {
    setName(activeGroup?.name || "");
    setDesc(activeGroup?.description || "");
    setIsPrivate(!!activeGroup?.is_private);
  }, [activeGroup?.id, activeGroup?.name, activeGroup?.description, activeGroup?.is_private]);

  useEffect(() => { setMyName(myDisplayName); }, [myDisplayName, activeGroup?.id]);

  if (!isAdmin) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {Z("只有群组拥有者和管理员可以修改群组设置。", "Only group owners and admins can change group settings.")}
      </p>
    );
  }

  const handleSave = () => {
    if (!activeGroupId || !name.trim()) return;
    updateGroup.mutate({ id: activeGroupId, name: name.trim(), description: desc || "", is_private: isPrivate }, {
      onSuccess: () => toast({ title: Z("群组已更新！", "Group updated!") }),
      onError: (err: any) => toast({ title: Z("保存失败", "Could not save"), description: err?.message, variant: "destructive" }),
    });
  };

  const handleDelete = () => {
    if (!activeGroupId) return;
    deleteGroup.mutate(activeGroupId, {
      onSuccess: () => { onDeleteSuccess(); toast({ title: Z("群组已删除", "Group deleted") }); },
    });
  };

  return (
    <Card className="border-transparent card-elevated max-w-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings className="h-4 w-4" /> {Z("群组设置", "Group Setting")}{activeGroup?.name ? ` — ${activeGroup.name}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div><Label>{Z("群组名称", "Group Name")}</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
        <div><Label>{Z("描述", "Description")}</Label><Textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} /></div>
        <div className="flex items-center justify-between">
          <div>
            <Label>{Z("私密群组", "Private Group")}</Label>
            <p className="text-xs text-muted-foreground">{Z("私密群组将被隐藏，仅限受邀加入", "Private groups are hidden and invite-only")}</p>
          </div>
          <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
        </div>
        <Button variant="coral" className="w-full" onClick={handleSave} disabled={updateGroup.isPending || !name.trim()}>{Z("保存修改", "Save Changes")}</Button>

        <div className="border-t pt-4">
          <Label>{Z("我在此群组的显示名", "My name in this group")}</Label>
          <p className="text-xs text-muted-foreground mb-2">{Z("群组内的所有内容都会显示这个名字。", "This is the name shown on everything you post in this group.")}</p>
          <div className="flex gap-2">
            <Input value={myName} onChange={e => setMyName(e.target.value)} />
            <Button variant="outline" disabled={!activeGroupId || !myName.trim() || updateMyName.isPending} onClick={() => {
              if (!activeGroupId || !myName.trim()) return;
              updateMyName.mutate({ groupId: activeGroupId, displayName: myName.trim() }, {
                onSuccess: () => toast({ title: Z("名字已更新", "Name updated") }),
                onError: (err: any) => toast({ title: Z("保存失败", "Could not save"), description: err?.message, variant: "destructive" }),
              });
            }}>{Z("保存", "Save")}</Button>
          </div>
        </div>

        {!isOwner && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">{Z("成员关系", "Membership")}</h4>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10">{Z("退出群组", "Leave Group")}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{Z("确定要退出此群组？", "Leave this care group?")}</AlertDialogTitle>
                  <AlertDialogDescription>{Z("您将失去对所有群组内容的访问。可通过加入码或邀请重新加入。", "You will lose access to all group content. You can rejoin with a join code or invitation.")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{Z("取消", "Cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={onLeaveGroup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{Z("退出群组", "Leave Group")}</AlertDialogAction>
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
                <Button variant="destructive" size="sm" className="w-full"><Trash2 className="h-4 w-4 mr-2" /> {Z("删除群组", "Delete Group")}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{Z("确定要删除此群组？", "Delete this care group?")}</AlertDialogTitle>
                  <AlertDialogDescription>{Z("此操作不可撤销。所有群组数据（包括帖子、任务和消息）将被永久删除。", "This action cannot be undone. All group data including posts, tasks, and messages will be permanently deleted.")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{Z("取消", "Cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{Z("删除群组", "Delete Group")}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
