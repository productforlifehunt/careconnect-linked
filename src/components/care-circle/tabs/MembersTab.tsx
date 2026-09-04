import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Shield, Heart, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface MembersTabProps {
  members: any[];
  activeGroupId: string | null;
  userId: string | undefined;
  isAdmin: boolean;
  isOwner: boolean;
  currentMember: any;
  updateRole: any;
  removeMember: any;
}

export function MembersTab({
  members, activeGroupId, userId, isAdmin, isOwner, currentMember, updateRole, removeMember,
}: MembersTabProps) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const [pendingRemoval, setPendingRemoval] = useState<any>(null);

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">{Z(`成员（${(members || []).length}）`, `Members (${(members || []).length})`)}</h3>
      <div className="space-y-2">
        {(members || []).map((m: any) => (
          <Card key={m.id} className="border-transparent card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {m.profile?.avatar_url ? <img src={m.profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <span className="text-primary font-medium">{(m.display_name || m.profile?.full_name || "?")[0]}</span>}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.display_name || Z("未填姓名", "No name")}</p>
                    <p className="text-xs text-muted-foreground">{m.profile?.email || ""}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {m.is_owner && <Badge variant="default" className="text-[10px] h-4">{Z("拥有者", "Owner")}</Badge>}
                      {m.is_admin && !m.is_owner && <Badge variant="secondary" className="text-[10px] h-4 gap-0.5"><Shield className="h-2.5 w-2.5" /> {Z("管理员", "Admin")}</Badge>}
                      {m.is_cared_one && <Badge className="text-[10px] h-4 bg-accent text-accent-foreground"><Heart className="h-2.5 w-2.5 mr-0.5" /> {Z("家人", "Loved One")}</Badge>}
                      {!m.is_owner && !m.is_admin && !m.is_cared_one && <Badge variant="outline" className="text-[10px] h-4">{Z("成员", "Member")}</Badge>}
                    </div>
                  </div>
                </div>
                {isAdmin && m.user_id !== userId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => updateRole.mutate({ memberId: m.id, groupId: activeGroupId, updates: { is_cared_one: !m.is_cared_one } })}>
                        <Heart className="h-3.5 w-3.5 mr-2" /> {m.is_cared_one ? Z("取消家人标记", "Remove Loved One") : Z("标记为家人", "Mark as Loved One")}
                      </DropdownMenuItem>
                      {!m.is_owner && (
                        <DropdownMenuItem onClick={() => updateRole.mutate({ memberId: m.id, groupId: activeGroupId, updates: { is_admin: !m.is_admin } })}>
                          <Shield className="h-3.5 w-3.5 mr-2" /> {m.is_admin ? Z("取消管理员", "Remove Admin") : Z("设为管理员", "Make Admin")}
                        </DropdownMenuItem>
                      )}
                      {isOwner && !m.is_owner && (
                        <DropdownMenuItem onClick={() => {
                          if (currentMember) {
                            updateRole.mutate({ memberId: currentMember.id, groupId: activeGroupId, updates: { is_owner: false } }, {
                              onSuccess: () => {
                                updateRole.mutate({ memberId: m.id, groupId: activeGroupId, updates: { is_owner: true, is_admin: true } }, {
                                  onSuccess: () => toast({ title: Z("拥有权已转移！", "Ownership transferred!") }),
                                });
                              },
                            });
                          }
                        }}>
                          <Shield className="h-3.5 w-3.5 mr-2" /> {Z("转移拥有权", "Transfer Ownership")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {!m.is_owner && (
                        <DropdownMenuItem className="text-destructive" onClick={() => setPendingRemoval(m)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> {Z("从护理群组中移除", "Remove from Group")}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {m.user_id === userId && <Badge variant="outline" className="text-[10px]">{Z("你", "You")}</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!pendingRemoval} onOpenChange={(o) => !o && setPendingRemoval(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{Z("确定要移除这位成员？", "Remove this member?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {Z(`「${pendingRemoval?.display_name || ""}」将失去该群组的全部访问权限，可以重新邀请。`, `“${pendingRemoval?.display_name || ""}” will lose access to this group. You can invite them again later.`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{Z("取消", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                const m = pendingRemoval;
                setPendingRemoval(null);
                if (!m) return;
                removeMember.mutate({ memberId: m.id, groupId: activeGroupId }, { onSuccess: () => toast({ title: Z("成员已移除", "Member removed") }) });
              }}
            >{Z("移除", "Remove")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
